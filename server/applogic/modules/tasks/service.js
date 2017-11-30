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
		
		modelPropFilter: "code type purpose name goal root_id parent_id status lastCommunication createdAt updatedAt"

		, modelPopulates: {
			"author": "persons",
			"inCharge": "persons"
		}
	},
	
	actions: {
		find: {
			cache: true,
			handler(ctx) {
				if (ctx.params.type !== undefined) {
					let filter = { type : ctx.params.type };
					let query = Task.find(filter);
					return ctx.queryPageSort(query).exec().then( (docs) => {
						return this.toJSON(docs);
					});
				} else if (ctx.params.root_id !== undefined) {
					let filter = { root_id : this.taskService.decodeID(ctx.params.root_id) };
					let query = Task.find(filter);
					return ctx.queryPageSort(query).exec().then( (docs) => {
						return this.toJSON(docs);
					});
				} else {
					let filter = { type : { $ne: "project" } };
					let query = Task.find(filter);
					return ctx.queryPageSort(query).exec().then( (docs) => {
						return this.toJSON(docs);
					});
				}
			}
		},

		// return a model by ID
		get: {
			cache: true,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
				return Promise.resolve(ctx.model);
			}
		},

		create(ctx) {
			this.validateParams(ctx, true);
			
			let task = new Task({
				type: ctx.params.type
                , name: ctx.params.name
                , purpose: ctx.params.purpose
				, goal: ctx.params.goal
				, status: ctx.params.status
				, root_id: (ctx.params.root !== undefined) ? this.taskService.decodeID(ctx.params.root) : -1
				, parent_id: null //Task.schema.methods.decodeID(ctx.params.root)
			});

			return task.save()
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
		},

		update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
			this.validateParams(ctx);

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
		},

		remove(ctx) {
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