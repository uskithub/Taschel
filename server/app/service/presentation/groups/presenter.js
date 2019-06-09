"use strict";

let logger 		= require("../../../../core/logger");
let config 		= require("../../../../config");
let response	= require("../../../../core/response");
let C 	 		= require("../../../../core/constants");

let _			= require("lodash");

let GroupRepository = require("../../infrastructure/repositories/monogodb/groupRepository");
let TaskRepository	= require("../../infrastructure/repositories/monogodb/taskRepository");

const notImplementedError = (funcName) => {
	const msg = `TODO: ${this.constructor.name}.${funcName} は未実装です。`;
	let err = new Error(msg);
	err = _.defaults(response.NOT_IMPLEMENTED);
	err.message = msg;
	return err;
};

const UNCLASSIFIED = "UNCLASSIFIED";
const ASSIGNED_IN_WEEKLY = "ASSIGNED_IN_WEEKLY";

const DEFAULT_WEEKLY_GROUPS = [
	{ name: "Conducive-Urgent", purpose: "for_the_top_priority_tasks" }
	, { name: "Conducive-Unurgent", purpose: "for_the_tasks_you_should_give_priority_to" }
	, { name: "Unconducive-Urgent", purpose: "for_the_tasks_you_should_doubt_their_priority" }
	, { name: "Unconducive-Unurgent", purpose: "for_the_tasks_you_should_not_do" }
];

// use this function to create an unclassifiedGroup.
const flatTree = (model, arr = []) => {
	arr.push(model);
	if (model.children && model.children.length > 0) {
		arr = model.children.reduce((result, m) => {
			return flatTree(m, result);
		}, arr);
	}
	return arr;
};

const isDescendant = (testee, tester) => {
	if (tester.children.length > 0) {
		for (let i in tester.children) {
			const child = tester.children[i];
			if (child.code == testee.code || isDescendant(testee, child)) {
				return true;
			}
		}
	}
	return false;
};

const deleteClassified = (inArr, excludes) => {
	return inArr.map(t => {
		t.children = t.children.filter( child => { return !excludes.includes(child.code); });
		t.children = deleteClassified(t.children, excludes);
		return t;
	});
};

module.exports = {
	settings: {
		name: "groups"
		, version: 1
		, namespace: "groups"
		, rest: true
		, ws: false
		, graphql: false
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: GroupRepository
		
		, modelPropFilter: "code type purpose name parent children author lastCommunication createdAt updatedAt"

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
	}
	
	, actions: {
		/**
		 * ProjectのGroupを取得し、分類されていない"Unclassified"なGroupを先頭にappendして返す。
		 * 
		 */
		find: {
			cache: true
			, handler(ctx) {

				// カンバン
				// 前提：看板用の group は proejct の create 時に task の service.js で作っている
				// 仕様：
				//	- milestone は一つの Layer となる
				//	- Layer 内に表示するのは TODO粒度のタスクのみ（issue, way, step, todo

				if (ctx.params.parent_code !== undefined) {
					const projectCode = ctx.params.parent_code;
					const projectId = this.taskService.decodeID(projectCode);
					// getting selected project model.
					return this.taskService.getByID(projectId)
						.then(projectJson => {
							let filter = {
								type : "kanban"
								, parent : projectId
							};
							let query = GroupRepository.find(filter);
							return ctx.queryPageSort(query).exec()
								.then(docs => {
									return this.toJSON(docs);
								})
								.then(jsons => {
									return this.populateModels(jsons);
								}).then(groupJsons => {
									// for getting unclassified tasks, create the classified tasks code array.
									let classifiedTaskCodes = groupJsons
										.reduce((arr, g) => {
											return arr.concat(g.children.map(child => { return child.code; }));
										}, []);
							
									// exclude status is closed or already classified tasks.
									const recursiveUnclassifiedFilter = (task, classifiedArray) => {
										task.children = task.children
											.filter(child => {
												return !(child.status < 0 || child.isDeleted === 1 || classifiedTaskCodes.includes(child.code));
											})
											.map(child => {
												return recursiveUnclassifiedFilter(child, classifiedArray);
											});
										return task;
									};

									let unclassifiedGroups = projectJson.children
										.reduce((result, child) => {
											if (child.status < 0 || child.isDeleted === 1 || classifiedTaskCodes.includes(child.code)) {
												return result;
											}
											child = recursiveUnclassifiedFilter(child, classifiedTaskCodes);
											// if (child.type === "milestone") {
											// 	result.push({
											// 		code: `MILESTONE-${child.code}`
											// 		, type: "kanban"
											// 		, name: child.name
											// 		, purpose: "for_classify"
											// 		, parent: projectCode
											// 		, children: child.children
											// 	});
											// }
											if (child.type === "issue" || child.type === "step" || child.type === "todo") {
												result[1].children.push(child);
											} else {
												result[0].children.push(child);
											}
											return result;
										}, [{
											code: UNCLASSIFIED
											, type: "kanban"
											, name: "unclassified"
											, purpose: "for_classify"
											, parent: projectCode
											, children: []
										}]);

									return unclassifiedGroups.concat(groupJsons);
								});
						});

				} else if (ctx.params.weekly !== undefined || ctx.params.week !== undefined) {
					const week = ctx.params.weekly || ctx.params.week;

					// 1) read groups
					// 2a) if groups.length == 0
					//		read tasks and make them an unclassified group
					// 2b) else 
					//		2b-1) make a classified tasks an array. 
					//			each groups' children and each tasks' children recursivly
					//		2b-2) make an unclassified group
					//			exclude what is descendant of the other task.
					//		2b-3) delete classified children which are in the classified group from unclassified group
					//		2b-4) delete classified top level children which are in the classified group from classified tasks' children
					let type = `weekly_${week}`;
					let userId = (ctx.params.user_code) ? this.personService.decodeID(ctx.params.user_code) : ctx.user.id;
					let filter = {
						$and : [ 
							{ author : userId }
							, { type : type }
						]
					};
					const excludeTaskRule = ((serviceName, json) => {
						if ( serviceName != "tasks" ) { return true; }
						return json.status > -1
							&& json.isDeleted != 1
							&& ["requirement", "issue", "way", "step", "todo"].includes(json.type)
							&& (json.author == userId || json.asignee == userId);
					});
					let query = GroupRepository.find(filter);
					return ctx.queryPageSort(query).exec()
						.then(docs => { 
							return this.toJSON(docs);
						})
						.then(jsons => {
							return this.populateModels(jsons, excludeTaskRule);
						})
						.then(groupJsons => {
						// status is open ( > -1)
						// type is "requirement", "way", "step" or "todo"
						// author or asignee is user
							let filter = {
								status : { $gt : -1 }
								, isDeleted : { $eq : 0 }
								, type : { $in: ["requirement", "issue", "way", "step", "todo"] }
								, $or : [ { author : userId }, { asignee : userId } ]
							};

							let query = TaskRepository.find(filter);
							return ctx.queryPageSort(query).exec()
								.then(docs => {
									return this.taskService.toJSON(docs);
								})
								.then(jsons => {
									return this.taskService.populateModels(jsons, excludeTaskRule);
								})
								.then(taskJsons => {

									if (groupJsons.length == 0) {
										// generating and returning default groups.
										// using reduce for array will be correct sequence.
										return DEFAULT_WEEKLY_GROUPS.reduce((promise, g) => {
											return promise.then(docs => {
												g.type = type;
												g.parent =  -1;
												g.author = userId;
												return GroupRepository.create(g)
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
												// exclude what is descendant of the other task.
												taskJsons = taskJsons.reduce((result, t) => {
													const otherJsons = taskJsons.filter(_t => { return _t.code != t.code; });
													for (let i in otherJsons) {
														const other = otherJsons[i];
														if (isDescendant(t, other)) {
															return result;
														}
													}
													result.push(t);
													return result;
												}, []);

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
									} else {
										// make a classified tasks an array. 
										let classifiedTaskCodes = groupJsons
											.reduce((arr, g) => { 
												return g.children.reduce((ret, t) => { 
													return ret.concat(flatTree(t)); 
												}, arr); 
											}, [])
											.map(j => { return j.code; });
									
										// make an unclassified group
										let unclassifiedTaskJsons = taskJsons.filter(t => { return !classifiedTaskCodes.includes(t.code); });

										// exclude what is descendant of the other task.
										unclassifiedTaskJsons = unclassifiedTaskJsons.reduce((result, t) => {
											const otherJsons = unclassifiedTaskJsons.filter(_t => { return _t.code != t.code; });
											for (let i in otherJsons) {
												const other = otherJsons[i];
												if (isDescendant(t, other)) {
													return result;
												}
											}
											result.push(t);
											return result;
										}, []);

										// delete classified children which are in the classified group from unclassified group
										unclassifiedTaskJsons = deleteClassified(unclassifiedTaskJsons, classifiedTaskCodes);

										let unclassifiedGroup = {
											code: UNCLASSIFIED
											, type: `weekly_${week}`
											, name: "unclassified"
											, purpose: "for_classify"
											, children: unclassifiedTaskJsons
										};

										// delete classified top level children which are in the classified group from classified tasks' children

										// make a classified top level tasks an array. 
										let classifiedTopLevelTaskCodes = groupJsons
											.reduce((arr, g) => { 
												return arr.concat(g.children); 
											}, [])
											.map(j => { return j.code; });

										groupJsons = groupJsons.map( g => { 
											g.children = deleteClassified(g.children, classifiedTopLevelTaskCodes);
											return g;
										});

										groupJsons.unshift(unclassifiedGroup);
										return groupJsons;
									}
								});
						});
				} else if (ctx.params.daily !== undefined || ctx.params.day !== undefined) {
					//
					// weeklyのgroupにアサインされているtaskをがっちゃんこして返す
					//
					const day = ctx.params.daily || ctx.params.day;
					let type = `weekly_${day}`;
					let userId = (ctx.params.user_code) ? this.personService.decodeID(ctx.params.user_code) : ctx.user.id;
					let filter = {
						$and : [ 
							{ author : userId }
							, { type : type }
						]
					};
					const excludeRule = ((serviceName, json) => {
						if ( serviceName != "tasks" ) { return true; }
						return json.status > -1 && (json.author == userId || json.asignee == userId);
					});
					let query = GroupRepository.find(filter);

					// 該当週のGroupを取得
					return ctx.queryPageSort(query).exec().then(docs => {
						return this.toJSON(docs);
					})
						.then(jsons => {
							if (jsons.length == 0) {
							// generating and returning default groups.
							// using reduce for array will be correct sequence.
								return DEFAULT_WEEKLY_GROUPS.reduce((promise, g) => {
									return promise.then(docs => {
										g.type = type;
										g.parent =  -1;
										g.author = userId;
										return GroupRepository.create(g)
											.then(doc => {
												docs.push(doc);
												return docs;
											});
									});
								}, Promise.resolve([]))
									.then(docs => {
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
								return this.populateModels(jsons, excludeRule)
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
			cache: true
			, handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:GroupNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);

			return GroupRepository.create({
				type: ctx.params.type
				, name: ctx.params.name
				, purpose: ctx.params.purpose
				, parent: (ctx.params.parent_code !== undefined) ? this.taskService.decodeID(ctx.params.parent_code) : -1
				, author : ctx.user.id
			})
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

			// for v2
			if (ctx.req.method === "PATCH") {
				return this.collection.findById(ctx.modelID).exec()
					.then(doc => {
						if (ctx.params.children) {
							doc.children = ctx.params.children.map(code => { return Number(this.taskService.decodeID(code)); });
						}
						return doc.save();
					})
					.then(json => {
						return this.populateModels(json);
					});
			}

			// TODO: delete below
			// for v1
			let movingId = this.taskService.decodeID(ctx.params.task);
			let index = ctx.params.index;

			console.log("● update", ctx.modelID, movingId, index, ctx.params.from);

			// ① from, to => UNCLASSIFIED|task, group	/api/groups/${to}?task=${moving}&index=${index}
			//		- toに追加のみ
			// ② from, to => group, UNCLASSIFIED|task	/api/groups/${from}?task=${moving}&index=${index}&remove=true
			//		- fromから削除のみ
			// ③ from, to => group, group				/api/groups/${to}?task=${moving}&index=${index}&from=${from}
			//	  1. from, to => xxx, yyy
			//		- toに追加
			//		- fromから削除
			//	  2. from, to => xxx, xxx
			//		- to（=from）内で移動
			return Promise.resolve()
				.then(() => {
					if (ctx.params.from) {
						let toId = ctx.modelID;
						let fromId = this.decodeID(ctx.params.from);
						if (toId != fromId) {
						// ③-1 from, to => xxx, yyy
							return this.collection.findById(toId).exec()
								.then(doc => {
									doc.children.splice(index, 0, movingId);
									return doc.save()
										.then(toDoc => {
											return this.collection.findById(fromId).exec()
												.then(fromDoc => {
													fromDoc.children = fromDoc.children.filter( c => { return c != movingId; });
													return fromDoc.save();
												})
												.then(fromDoc => {
													// return [toDoc, fromDoc];
													return this.actions.find(ctx);
												});
										});
								});	
						} else {
						// ③-2 from, to => xxx, xxx
							return this.collection.findById(toId).exec()
								.then(doc => {
									doc.children = doc.children.filter( c => { return c != movingId; });
									doc.children.splice(index, 0, movingId);
									return doc.save()
										.then(doc => {
											// return [doc];
											return this.actions.find(ctx);
										});
								});
						}
				
					} else {
						if (ctx.params.remove) {
						// ② from, to => xxx, UNCLASSIFIED|task
							let fromId = ctx.modelID;
							return this.collection.findById(fromId).exec()
								.then(fromDoc => {
									fromDoc.children = fromDoc.children.filter( c => { return c != movingId; });
									return fromDoc.save();
								})
								.then(fromDoc => {
									// return [fromDoc];
									return this.actions.find(ctx);
								});
						} else {
						// ① from, to => UNCLASSIFIED|task, group
							let toId = ctx.modelID;
							return this.collection.findById(toId).exec()
								.then(doc => {
									doc.children.splice(index, 0, movingId);
									return doc.save()
										.then(doc => {
											// return [doc];
											return this.actions.find(ctx);
										});
								});	
						}
					}
				})
			// .then(docs => {
			// 	return this.toJSON(docs);
			// })
			// .then(jsons => {
			// 	return this.populateModels(jsons);
			// })
				.then(jsons => {
					this.notifyModelChanges(ctx, "updated", jsons);
					return jsons;
				});								
		}

		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:GroupNotFound"));

			return TaskRepository.remove({ _id: ctx.modelID })
				.then(() => {
					return ctx.model;
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "removed", json);
					return json;
				});		
		}
	}
	
	, methods: {
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
	}	

	, init(ctx) {
		// Fired when start the service
		this.taskService = ctx.services("tasks");
		this.personService = ctx.services("persons");
	}

};