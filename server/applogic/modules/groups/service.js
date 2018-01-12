"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Group 		= require("./models/group");
let Task 		= require("../tasks/models/task");

const UNCLASSIFIED = "UNCLASSIFIED";
const ASSIGNED_IN_WEEKLY = "ASSIGNED_IN_WEEKLY";

const DEFAULT_WEEKLY_GROUPS = [
	{ name: "Conducive-Urgent", purpose: "for_the_top_priority_tasks" }
	, { name: "Conducive-Unurgent", purpose: "for_the_tasks_you_should_give_priority_to" }
	, { name: "Conducive-Unurgent" , purpose: "for_the_tasks_you_should_give_priority_to" }
	, { name: "Unconducive-Urgent", purpose: "for_the_tasks_you_should_doubt_their_priority" }
];

const DEFAULT_DAILY_GROUPS = [
	{ name: "Monday", purpose: "for_monday" }
	, { name: "Tuesday", purpose: "for_tuesday" }
	, { name: "Wednesday" , purpose: "for_wednesday" }
	, { name: "Thursday", purpose: "for_thursday" }
	, { name: "Friday", purpose: "for_friday" }
];

module.exports = {
	settings: {
		name: "groups",
		version: 1,
		namespace: "groups",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Group,
		
		modelPropFilter: "code type purpose name parent children author lastCommunication createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			// , "parent": "tasks"		//
			"children": "tasks"
		}
		, idEncodes: {
			"parent": "tasks"
			, "author": "persons"
		}
	},
	
	actions: {
		/**
		 * ProjectのGroupを取得し、分類されていない"Unclassified"なGroupを先頭にappendして返す。
		 * 
		 */
		find: {
			cache: true,
			handler(ctx) {
				// TODO: group -> taskの検索順にし、Groupがない場合は [] を返してdefaultグループを作るように促す
				if (ctx.params.parent_code != undefined) {
					// root is the project
					// type is "requirement", "way" or "step"
					// has no children
					let filter = {
						root : this.taskService.decodeID(ctx.params.parent_code)
						, type : { $in: ["requirement", "way", "step"] }
						, children : { $size: 0 }
					};
					let query = Task.find(filter);
					// 選択されているProjectのTaskを取得
					return ctx.queryPageSort(query).exec()
					.then(taskDocs => {
						let filter = {
							type : "kanban"
							, parent : this.taskService.decodeID(ctx.params.parent_code)
						};
						let query = Group.find(filter);
						// 選択されているProjectのGroupを取得
						return ctx.queryPageSort(query).exec().then(docs => {
							return this.toJSON(docs);
						})
						.then(jsons => {
							// 既存Groupに分類されていないTaskを未分類とする
							let classifiedTasks = jsons.reduce((arr, g) => {
								return arr.concat(g.children);
							}, []);
							
							let unclassifiedTaskDocs = taskDocs.filter(d => { return !classifiedTasks.includes(d._id); });

							return Promise.resolve()
							.then(() => {
								return this.taskService.toJSON(unclassifiedTaskDocs);
							}).then(unclassifiedTaskJsons => {
								return this.taskService.populateModels(unclassifiedTaskJsons);
							})
							.then(unclassifiedTaskJsons => {
								// 選択されているProjectのopenのmilestoneを持ってくる
								let filter = {
									root : this.taskService.decodeID(ctx.params.parent_code)
									, type : "milestone"
									, status : { $gt : -1 }
								};
								let query = Task.find(filter);
								
								return ctx.queryPageSort(query).exec()
								.then(milestoneDocs => {
									return this.taskService.toJSON(milestoneDocs);
								})
								.then(milestoneJsons => {
									return this.taskService.populateModels(milestoneJsons);
								})
								.then(milestoneJsons => {
									// 子孫を全部一つのchildrenに集約
									let recursiveReduceChildren = (obj, isOnlyLeaf = true, result = []) => {
										if (obj.children == null || obj.children.length == 0) {
											if (isOnlyLeaf) result.push(obj);
											return result;
										} else {
											return obj.children.reduce((sums, child) => {
												if (!isOnlyLeaf) sums.push(child);
												return recursiveReduceChildren(child, isOnlyLeaf, sums);
											}, result);
										}
									};

									// milestoneに分類されていないTaskを未分類として、未分類＋milestoneDummyGroup＋既存Groupを返す
									let classifiedDummyGroupJsons = milestoneJsons.reduce((arr, mJson) => {
										let g = {
											code: UNCLASSIFIED
											, type: "kanban"
											, name: mJson.name
											, purpose: "for_classify"
											, parent: ctx.params.parent_code
											, children: []
										};

										const allChildren = recursiveReduceChildren(mJson);

										// milestoneの子タスクは、unclassifiedTaskDocsにあるものだけ残す
										// unclassifiedTaskDocsは、milestoneにあったら取り除く
										// finally, どのmilestoneにも含まれないもの、milestoneに含まれunclissifiedなものに分かれる
										arr[0].children = arr[0].children.filter( ut => {
											if (allChildren.map(c => { return c.code; }).includes(ut.code)) {
												g.children.push(ut);
												return false;
											} else {
												return true;
											}
										});
										arr.push(g);
										return arr;
									}, [{
										code: UNCLASSIFIED
										, type: "kanban"
										, name: "unclassified"
										, purpose: "for_classify"
										, parent: ctx.params.parent_code
										, children: unclassifiedTaskJsons
									}]);

									return this.populateModels(jsons)
									.then(jsons => {
										return classifiedDummyGroupJsons.filter(json => { return json.children.length > 0; }).concat(jsons);
									})
								});
							});
						});
					});

				} else if (ctx.params.weekly != undefined) {
					let type = `weekly_${ctx.params.weekly}`;
					let userId = (ctx.params.user_code) ? this.personService.decodeID(ctx.params.user_code) : ctx.user.id;
					let filter = {
						$and : [ 
							{ author : userId }
							, { type : type }
						]
					};

					let query = Group.find(filter);

					// 該当週のGroupを取得
					return ctx.queryPageSort(query).exec().then(docs => {
						return this.toJSON(docs);
					})
					.then(jsons => {
						// status is open ( > -1)
						// type is "requirement", "way" or "step"
						// has no children
						// author or asignee is user
						// let filter = {
						// 	status : { $gt : -1 }
						// 	, type : { $in: ["requirement", "way", "step"] }
						// 	, children : { $size: 0 }
						// 	, $or : [ { author : userId }, { asignee : userId } ]
						// };

						// status is open ( > -1)
						// type is "requirement", "way", "step", "todo"
						// has no children
						// author or asignee is user
						let filter = {
							status : { $gt : -1 }
							, type : { $in: ["requirement", "way", "step"] }
							, children : { $size: 0 }
							, $or : [ { author : userId }, { asignee : userId } ]
						};
						let query = Task.find(filter);

						// myTasksでクローズしていないものを取得
						return ctx.queryPageSort(query).exec()
						.then(taskDocs => {

							if (jsons.length == 0) {
								// TODO: 該当週のデータがないならないで返す？
								// this.notifyNotSetupYet(ctx);
								
								// generating and returning default groups.
								// using reduce for array will be correct sequence.
								return DEFAULT_WEEKLY_GROUPS.reduce((promise, g) => {
									return promise.then(docs => {
										g.type = type;
										g.parent =  -1;
										g.author = userId;
										let group = new Group(g);
										return group.save()
										.then(doc => {
											docs.push(doc);
											return docs;
										});
									});
								}, Promise.resolve([]))
								.then(docs => {
									return this.toJSON(docs);
								})
								.then(jsons => {
									return this.populateModels(jsons);
								})
								.then(jsons => {
									return Promise.resolve()
									.then(() => {
										return this.toJSON(taskDocs);
									})
									.then(taskJsons => {
										return this.populateModels(taskJsons);
									})
									.then(taskJsons => {
										// 既存Groupに分類されていないTaskを未分類として既存Groupとともに返す
										let unclassifiedGroup = {
											code: UNCLASSIFIED
											, type: type
											, name: "unclassified"
											, purpose: "for_classify"
											, children: taskJsons
										};
										jsons.unshift(unclassifiedGroup);
										return jsons;
									});
								});
							} else {
								// ある場合は未分類Groupと一緒に返す
								// 既存Groupに分類されていないTaskを未分類として既存Groupとともに返す
								let classifiedTasks = jsons.reduce((arr, g) => {
									return arr.concat(g.children);
								}, []);
								// taskはJSONにすると_idでの突き合わせができなくなるのでしない
								let unclassifiedTaskDocs = taskDocs.filter(t => { return !classifiedTasks.includes(t._id); });

								return Promise.resolve().then(() => {
									return this.taskService.toJSON(unclassifiedTaskDocs);
								})
								.then(unclassifiedTaskJsons => {
									return this.taskService.populateModels(unclassifiedTaskJsons);
								})
								.then(unclassifiedTaskJsons => {
									return this.populateModels(jsons)
									.then(jsons => {
										let unclassifiedGroup = {
											code: UNCLASSIFIED
											, type: `weekly_${ctx.params.weekly}`
											, name: "unclassified"
											, purpose: "for_classify"
											, children: unclassifiedTaskJsons
										};
										jsons.unshift(unclassifiedGroup);
										return jsons;
									});
								});
							}
						});
					});
				} else if (ctx.params.daily != undefined) {
					//
					// weeklyのgroupにアサインされているtaskをがっちゃんこして返す
					//
					let type = `weekly_${ctx.params.daily}`;
					let userId = (ctx.params.user_code) ? this.personService.decodeID(ctx.params.user_code) : ctx.user.id;
					let filter = {
						$and : [ 
							{ author : userId }
							, { type : type }
						]
					};
					let query = Group.find(filter);

					// 該当週のGroupを取得
					return ctx.queryPageSort(query).exec().then(docs => {
						return this.toJSON(docs);
					})
					.then(jsons => {
						if (jsons.length == 0) {
							// TODO: 該当週のデータがないならないで返す？
							// this.notifyNotSetupYet(ctx);
							let promises = [];

							DEFAULT_WEEKLY_GROUPS.forEach(g => {
								g.type = type;
								g.parent =  -1;
								g.author = userId;
								let group = new Group(g);
								promises.push(group.save());
							});

							return Promise.all(promises).then(docs => {
								const assignedInWeeklyGroup = {
									code: ASSIGNED_IN_WEEKLY
									, type: type
									, name: "assignedInWeekly"
									, purpose: "for_assigning"
									, children: []
								};
								return [assignedInWeeklyGroup];
							});
						} else {
							return this.populateModels(jsons)
							.then(jsons => {
								const assignedInWeekly = jsons.reduce((arr, g) => {
									return arr.concat(g.children);
								}, []);
	
								const assignedInWeeklyGroup = {
									code: ASSIGNED_IN_WEEKLY
									, type: type
									, name: "assignedInWeekly"
									, purpose: "for_assigning"
									, children: assignedInWeekly
								};
	
								return [assignedInWeeklyGroup];
							});
						}
					});
				}
			}
		}

		// return a model by ID
		, get: {
			cache: true,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:GroupNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);

			let group = new Group({
				type: ctx.params.type
                , name: ctx.params.name
                , purpose: ctx.params.purpose
				, parent: (ctx.params.parent_code !== undefined) ? this.taskService.decodeID(ctx.params.parent_code) : -1
				, author : ctx.user.id
			});

			return group.save()
			.then(doc => {
				return this.toJSON(doc);
			})
			.then(json => {
				return this.populateModels(json);
			})
			.then(json => {
				this.notifyModelChanges(ctx, "created", { user: ctx.user, json: json } );
				return json;
			});
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:GroupNotFound"));
			this.validateParams(ctx);

			let movingId = this.taskService.decodeID(ctx.params.task);
			let index = ctx.params.index;

			console.log("● update", ctx.modelID, movingId, index, ctx.params.from);

			// ① from, to => UNCLASSIFIED, xxx
			//		- toに追加のみ
			// ② from, to => xxx, UNCLASSIFIED
			//		- fromから削除のみ
			// ③ from, to => xxx, yyy
			//		- toに追加
			//		- fromから削除
			// ④ from, to => xxx, xxx
			//		- to（=from）内で移動

			return Promise.resolve()
			.then(() => {
				if (ctx.params.from) {
					let toId = ctx.modelID;
					if (ctx.params.from == UNCLASSIFIED) {
						// ① from, to => UNCLASSIFIED, xxx
						return this.collection.findById(toId).exec()
						.then((doc) => {
							doc.children.splice(index, 0, movingId);
							return doc.save()
							.then((doc) => {
								return [doc];
							});
						});	
					} else {
						let fromId = this.groupService.decodeID(ctx.params.from);
						if (toId != fromId) {
							// ③ from, to => xxx, yyy
							return this.collection.findById(toId).exec()
							.then((doc) => {
								doc.children.splice(index, 0, movingId);
								return doc.save()
								.then((toDoc) => {
									return this.collection.findById(fromId).exec()
									.then((fromDoc) => {
										fromDoc.children = fromDoc.children.filter( c => { return c != movingId; });
										return fromDoc.save();
									})
									.then((fromDoc) => {
										return [toDoc, fromDoc];
									});
								});
							});	
						} else {
							// ④ from, to => xxx, xxx
							return this.collection.findById(toId).exec()
							.then((doc) => {
								doc.children = doc.children.filter( c => { return c != movingId; });
								doc.children.splice(index, 0, movingId);
								return doc.save()
								.then((doc) => {
									return [doc];
								});
							});
						}
					}
				} else {
					// ② from, to => xxx, UNCLASSIFIED
					let fromId = ctx.modelID;
					return this.collection.findById(fromId).exec()
					.then((fromDoc) => {
						fromDoc.children = fromDoc.children.filter( c => { return c != movingId; });
						return fromDoc.save();
					})
					.then((fromDoc) => {
						return [fromDoc];
					});
				}
			})
			.then((docs) => {
				return this.toJSON(docs);
			})
			.then((jsons) => {
				return this.populateModels(jsons);
			})
			.then((jsons) => {
				this.notifyModelChanges(ctx, "updated", jsons);
				return jsons;
			});								
		}

		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:GroupNotFound"));

			return Task.remove({ _id: ctx.modelID })
			.then(() => {
				return ctx.model;
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "removed", json);
				return json;
			});		
		}
	},
	
	methods: {
		/**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 * 
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
		validateParams(ctx, strictMode) {
			if (strictMode || ctx.hasParam("name"))
				ctx.validateParam("name").trim().notEmpty(ctx.t("app:GroupNameCannotBeBlank")).end();

			ctx.validateParam("purpose").trim().end();
			ctx.validateParam("type").trim().end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	},	

	init(ctx) {
		// Fired when start the service
		this.groupService = ctx.services("groups");
		this.taskService = ctx.services("tasks");
		this.personService = ctx.services("persons");
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	},

	graphql: {

		query: `
			groups(limit: Int, offset: Int, sort: String): [Task]
			group(code: String): Task
		`,

		types: `
			type Group {
				code: String!
				purpose: String
				type: String
				name: String
				status: Int
				lastCommunication: Timestamp
			}
		`,

		mutation: `
			groupCreate(name: String!, purpose: String, type: String, goal: String, status: Int): Group
			groupUpdate(code: String!, name: String, purpose: String, type: String, goal: String, status: Int): Group
			groupRemove(code: String!): Group
		`,

		resolvers: {
			Query: {
				groups: "find",
				group: "get"
			},

			Mutation: {
				groupCreate: "create",
				groupUpdate: "update",
				groupRemove: "remove"
			}
		}
	}

};

/*
## GraphiQL test ##

# Find all devices
query getDevices {
  devices(sort: "lastCommunication", limit: 5) {
    ...deviceFields
  }
}

# Create a new device
mutation createDevice {
  deviceCreate(name: "New device", address: "192.168.0.1", type: "raspberry", description: "My device", status: 1) {
    ...deviceFields
  }
}

# Get a device
query getDevice($code: String!) {
  device(code: $code) {
    ...deviceFields
  }
}

# Update an existing device
mutation updateDevice($code: String!) {
  deviceUpdate(code: $code, address: "127.0.0.1") {
    ...deviceFields
  }
}

# Remove a device
mutation removeDevice($code: String!) {
  deviceRemove(code: $code) {
    ...deviceFields
  }
}

fragment deviceFields on Device {
    code
    address
    type
    name
    description
    status
    lastCommunication
}

*/