"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Group 		= require("./models/group");

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
			// , "author": "persons"	// TODO: 情報量が多くなりすぎるのpopulateを削る
		}
		, idEncodes: {
			"parent": "tasks"
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
					filter.root = this.groupService.decodeID(ctx.params.root_code);
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
			
			let group = new Group({
				type: ctx.params.type
                , name: ctx.params.name
                , purpose: ctx.params.purpose
				, parent: (ctx.params.parent_code !== undefined) ? this.groupService.decodeID(ctx.params.parent_code) : -1
				, author : ctx.user.id
			});

			return group.save()
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

			let parentId = this.groupService.decodeID(ctx.params.parent_code);
			let childId = this.groupService.decodeID(childJson.code);

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
			ctx.validateParam("type").trim().end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	},	

	init(ctx) {
		// Fired when start the service
		this.groupService = ctx.services("groups");
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