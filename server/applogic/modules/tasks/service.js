"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Task 		= require("./models/task");

module.exports = {
	settings: {
		name: "tasks",
		version: 1,
		namespace: "tasks",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Task,
		
		modelPropFilter: "code type purpose name goal status root parent children author asignee lastCommunication createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			// , "parent": "tasks"		//
			"children": "tasks"
			, "author": "persons"
			, "asignee": "persons"
		}
		, idEncodes: {
			"root": "tasks"
			, "parent": "tasks"
		}
	},
	
	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				if (ctx.params.type !== undefined) {
					// /tasks?type=project
					filter.type = ctx.params.type;
				} else if (ctx.params.root_code !== undefined) {
					// /tasks?root_code=${hash}
					filter.root = this.taskService.decodeID(ctx.params.root_code);
				} else if (ctx.params.user_code !== undefined) {
					// /tasks?user_code=${hash}
					let user_code = this.personService.decodeID(ctx.params.user_code);
					filter.$or = [ {author : user_code}, {asignee : user_code} ];
				} else {
					filter.type = { $ne: "project" };
				}

				let query = Task.find(filter);

				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		},

		// return a model by ID
		get: {
			cache: true,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);
			
			let task = new Task({
				type: ctx.params.type
                , name: ctx.params.name
                , purpose: ctx.params.purpose
				, goal: ctx.params.goal
				, status: ctx.params.status
				, root: (ctx.params.root_code !== undefined) ? this.taskService.decodeID(ctx.params.root_code) : -1
				, parent: (ctx.params.parent_code !== undefined) ? this.taskService.decodeID(ctx.params.parent_code) : -1
				, author : ctx.user.id
				, asignee : (ctx.params.asignee_code !== undefined) ? this.personService.decodeID(ctx.params.asignee_code) : -1
			});

			return task.save()
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				if (ctx.params.parent_code !== undefined) {
					// breakdownの場合
					return this.actions.breakdown(ctx, json);
				} else {
					this.notifyModelChanges(ctx, "created", json);
					return json;
				}
			});
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
			this.validateParams(ctx);

			if (ctx.params.arrange) {
				return this.actions.arrange(ctx, ctx.params.arrange);
			}

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {

				if (ctx.params.purpose != null)
					doc.purpose = ctx.params.purpose;

				if (ctx.params.type != null)
					doc.type = ctx.params.type;

				if (ctx.params.name != null)
					doc.name = ctx.params.name;

				if (ctx.params.goal != null)
					doc.goal = ctx.params.goal;

				if (ctx.params.status != null)
					doc.status = ctx.params.status;

				return doc.save();
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "updated", json);
				return json;
			});								
		}

		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));

			return Task.remove({ _id: ctx.modelID })
			.then(() => {
				return ctx.model;
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "removed", json);
				return json;
			});		
		}

		// 子タスクのcreate時に、同時に親の方に子タスクを付け加える
		, breakdown(ctx, childJson) {
			// TODO: エラーコード／メッセージは見直すこと
			if (ctx.params.parent_code === undefined)
				throw this.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:TaskNotFound"));

			let parentId = this.taskService.decodeID(ctx.params.parent_code);
			let childId = this.taskService.decodeID(childJson.code);

			return this.collection.findById(parentId).exec()
			.then((doc) => {
				return Task.findByIdAndUpdate(doc.id, { $addToSet: { children: childId }}, { "new": true });
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "brokedown", { parent : json, child : childJson });
				return { parent : json, child : childJson };
			});
		}

		// タスクの入れ替え
		, arrange(ctx, type) {
			// TODO: バリデータ
			// ?arrange=above&target=${target.code}&targetParent=${target.parent.code}

			let movingId = this.taskService.decodeID(ctx.params.code);
			let targetId = this.taskService.decodeID(ctx.params.target);
			let targetParentId = this.taskService.decodeID(ctx.params.targetParent);
			let parentId = this.taskService.decodeID(ctx.params.parent);
			
			let promises = [];

			// movingがtargetの兄になる
			// 1. (moving->parent).cildrenからmovingを削除
			// 2. moving.parentにtarget.parentを設定
			// 3. (target->parent).childrenにmovingを追加（targetの前に）

			// movingがtargetの子になる
			// 1. (moving->parent).cildrenからmovingを削除
			// 2. moving.parentにtargetを設定
			// 3. target.childrenにmovingを追加（先頭）

			// movingがtargetの弟になる
			// 1. (moving->parent).cildrenからmovingを削除
			// 2. moving.parentにtarget.parentを設定
			// 3. (target->parent).childrenにmovingを追加（targetの後に）
			
			// above/into/below共通
			// 1. (moving->parent).cildrenからmovingを削除
			promises.push(this.collection.findById(parentId).exec()
				.then((parentDoc) => {
					parentDoc.children = parentDoc.children.filter(c => c != movingId);
					parentDoc.save();

					// into 3. target.childrenにmovingを追加（先頭）
					if (type == "into") {
						return this.collection.findById(targetId).exec()
						.then((targetDoc) => {
							targetDoc.children.unshift(movingId);
							targetDoc.save();
							return [parentDoc, targetDoc];
						});
					}

					// above 3. (target->parent).childrenにmovingを追加（targetの前に）
					// below 3. (target->parent).childrenにmovingを追加（targetの後に）
					return Promise.resolve()
					.then(() => {
						// 親が同じ中で入れ替えの場合はわざわざfindしない
						if (parentId == targetParentId) {
							return parentDoc;
						} else {
							return this.collection.findById(targetParentId).exec();
						}
					}).then((targetParentDoc) => {
						let index = 0;
						for (let i in targetParentDoc.children) {
							let c = targetParentDoc.children[i];
							if (c == targetId) {
								break;
							}
							index++;
						}
						console.log("● before:", targetParentDoc.children);
						targetParentDoc.children.splice((type=="below" ? index+1 : index), 0, movingId);
						console.log("● after :", targetParentDoc.children);
						targetParentDoc.save();
	
						return [parentDoc, targetParentDoc];
					});
				})
			);
			
			promises.push(this.collection.findById(movingId).exec()
				.then((movingDoc) => {
					if (type == "into") {
						// into 2. moving.parentにtargetを設定
						movingDoc.parent = targetId;
					} else {
						// above/below共通
						// 2. moving.parentにtarget.parentを設定
						movingDoc.parent = targetParentId;
					}
					movingDoc.save();
					return movingDoc;
				})
			);

			return Promise.all(promises)
			.then((docs) => {
				// flatten
				return [docs[1], docs[0][0], docs[0][1]];
			})
			.then((docs) => {
				console.log("●", docs);
				return this.toJSON(docs);
			})
			.then((jsons) => {
				return this.populateModels(jsons);
			})
			.then((jsons) => {
				this.notifyModelChanges(ctx, "arranged", jsons);
				if (type == "into") {
					return {
						moving : jsons[0]
						, movingParent : jsons[1]
						, target : jsons[0]
						
					};
				} else {
					return {
						moving : jsons[0]
						, movingParent : jsons[1]
						, targetParent : jsons[2]
					};
				}
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
				ctx.validateParam("name").trim().notEmpty(ctx.t("app:TaskNameCannotBeBlank")).end();

			if (strictMode || ctx.hasParam("status"))
				ctx.validateParam("status").isNumber();

			ctx.validateParam("purpose").trim().end();
			ctx.validateParam("goal").trim().end();
			ctx.validateParam("type").trim().end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	},	

	init(ctx) {
		// Fired when start the service
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
			tasks(limit: Int, offset: Int, sort: String): [Task]
			task(code: String): Task
		`,

		types: `
			type Task {
				code: String!
				purpose: String
				type: String
				name: String
				goal: String
				status: Int
				lastCommunication: Timestamp
			}
		`,

		mutation: `
			taskCreate(name: String!, purpose: String, type: String, goal: String, status: Int): Task
			taskUpdate(code: String!, name: String, purpose: String, type: String, goal: String, status: Int): Task
			taskRemove(code: String!): Task
		`,

		resolvers: {
			Query: {
				tasks: "find",
				task: "get"
			},

			Mutation: {
				taskCreate: "create",
				taskUpdate: "update",
				taskRemove: "remove"
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