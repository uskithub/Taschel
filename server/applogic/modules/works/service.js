"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Work 		= require("./models/work");

module.exports = {
	settings: {
		name: "works",
		version: 1,
		namespace: "works",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Work,
		
		modelPropFilter: "code title start end week parent author asignee lastCommunication createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			"parent": "tasks"		//
		}
		, idEncodes: {
			"author": "persons"
			, "asignee": "persons"
		}
	}
	
	, actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {
					asignee : this.personService.decodeID(ctx.params.user)
                    , week : ctx.params.week
				};

				let query = Work.find(filter);

				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
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
			
			let work = new Work({
				title: ctx.params.title
				, start: ctx.params.start
				, end: ctx.params.end
				, week: ctx.params.week
				, parent: this.taskService.decodeID(ctx.params.parent_code)
				, author : ctx.user.id
				, asignee : ctx.user.id
			});

			return work.save()
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
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

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {

				if (ctx.params.purpose != null)
					doc.purpose = ctx.params.purpose;

				if (ctx.params.root_code != null) {
					doc.root = this.taskService.decodeID(ctx.params.root_code);
					// TODO: parentを取得し、rootがblankの場合、同じrootを指定、blankでなければ親子のreleationを切り離す、を先祖に遡って実施
					// TODO: 全ての子孫を再帰的に、同じrootを指定する必要あり
				}

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

			return Work.remove({ _id: ctx.modelID })
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
			if (strictMode || ctx.hasParam("title"))
				ctx.validateParam("title").trim().notEmpty(ctx.t("app:WorkTitleCannotBeBlank")).end();

			// if (strictMode || ctx.hasParam("status"))
			// 	ctx.validateParam("status").isNumber();

			// ctx.validateParam("purpose").trim().end();
			// ctx.validateParam("goal").trim().end();
			// ctx.validateParam("type").trim().end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	}

	, init(ctx) {
		// Fired when start the service
		this.taskService = ctx.services("tasks");
		this.personService = ctx.services("persons");
	}

	, socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	}

	, graphql: {

		query: `
			works(limit: Int, offset: Int, sort: String): [Work]
			work(code: String): Work
		`,

		types: `
			type Work {
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
			workCreate(name: String!, purpose: String, type: String, goal: String, status: Int): Work
			workUpdate(code: String!, name: String, purpose: String, type: String, goal: String, status: Int): Work
			workRemove(code: String!): Work
		`,

		resolvers: {
			Query: {
				works: "find",
				work: "get"
			},

			Mutation: {
				workCreate: "create",
				workUpdate: "update",
				workRemove: "remove"
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