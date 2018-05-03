"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Organization = require("./models/organization");

module.exports = {
	settings: {
		name: "organizations"
		, version: 1
		, namespace: "organizations"
		, rest: true
		, ws: true
		, graphql: true
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: Organization
		, modelPropFilter: "code type name members projects administrators isDeleted createdAt updatedAt"
		, modelPopulates: {
			"members": "users"
			, "administrators": "users"
			, "projects": "tasks"
		}
		, idEncodes: {
		}
	}
	
	, actions: {
		find: {
			cache: true
			, handler(ctx) {
				let filter = {};
				let query = Organization.find(filter);

				return ctx.queryPageSort(query).exec().then(docs => {
					return this.toJSON(docs);
				})
				.then(json => {
					return this.populateModels(json);
				});
			}
		}

		// return a model by ID
		, get: {
			cache: true,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);
			
			let organization = new Organization({
				type: ctx.params.type
				, name: ctx.params.name
			});

			return organization.save()
				.then(doc => {
					return this.toJSON(doc);				
				})
				.then(json => {
					return this.populateModels(json);
				})
				.then(json => {
					this.notifyModelChanges(ctx, "created", json);
					return json;
				});
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
			this.validateParams(ctx);

			if (ctx.params.arrange) {
				return this.actions.arrange(ctx, ctx.params.arrange);
			}

			if (ctx.params.task) {
				return this.actions.arrange2(ctx);
			}

			return this.collection.findById(ctx.modelID).exec()
				.then(doc => {

					if (ctx.params.purpose != null)
						doc.purpose = ctx.params.purpose;

					if (ctx.params.root_code != null) {
						doc.root = this.decodeID(ctx.params.root_code);
						// TODO: parentを取得し、rootがblankの場合、同じrootを指定、blankでなければ親子のreleationを切り離す、を先祖に遡って実施
						// TODO: 全ての子孫を再帰的に、同じrootを指定する必要あり
					}

					if (ctx.params.type != null)
						doc.type = ctx.params.type;

					if (ctx.params.name != null)
						doc.name = ctx.params.name;

					if (ctx.params.shortname != null)
						doc.shortname = ctx.params.shortname;

					if (ctx.params.goal != null)
						doc.goal = ctx.params.goal;

					if (ctx.params.description != null)
						doc.description = ctx.params.description;

					if (ctx.params.status != null)
						doc.status = ctx.params.status;

					if (ctx.params.asignee_code != null)
						doc.asignee = this.personService.decodeID(ctx.params.asignee_code);

					if (ctx.params.closingComment != null)
						doc.closingComment = ctx.params.closingComment;

					return doc.save();
				})
				.then(doc => {
					return this.toJSON(doc);
				})
				.then(json => {
					return this.populateModels(json);
				})
				.then(json => {
					this.notifyModelChanges(ctx, "updated", json);
					return json;
				});								
		}

		// TODO: 親からの参照を外す、childrenも再帰的に削除
		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
			
			// 物理削除の場合
			//return Task.remove({ _id: ctx.modelID })

			// 論理削除とする
			return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					doc.isDeleted = true;
					return doc.save();
				})
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
				ctx.validateParam("name").trim().notEmpty(ctx.t("app:TaskNameCannotBeBlank")).end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	}

	, init(ctx) {
		// Fired when start the service
		this.personService = ctx.services("persons");
		this.taskService = ctx.services("tasks");
	}

	, socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	}

	, graphql: {

		query: `
			organizations(limit: Int, offset: Int, sort: String): [Organization]
			organization(code: String): Organization
		`,

		types: `
			type Organization {
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
			organizationCreate(name: String!, purpose: String, type: String, goal: String, status: Int): Organization
			organizationUpdate(code: String!, name: String, purpose: String, type: String, goal: String, status: Int): Organization
			organizationRemove(code: String!): Organization
		`,

		resolvers: {
			Query: {
				organizations: "find",
				organization: "get"
			},

			Mutation: {
				organizationCreate: "create",
				organizationUpdate: "update",
				organizationRemove: "remove"
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