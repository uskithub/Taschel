"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Comment 	= require("./models/comment");
let Work 		= require("../../../app/service/infrastructure/repositories/monogodb/workRepository");
let Review 		= require("../../../app/service/infrastructure/repositories/monogodb/reviewRepository");

module.exports = {
	settings: {
		name: "comments"
		, version: 1
		, namespace: "comments"
		, rest: true
		, ws: true
		, graphql: true
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: Comment
		
		, modelPropFilter: "code description work review replies author createdAt updatedAt"

		, modelPopulates: {
			"replies": "comments"
		}
		, idEncodes: {
			"work": "works"
			, "review": "reviews"
			, "author": "persons"
		}
	}
	
	, actions: {
		find: {
			cache: true
			, handler(ctx) {
				let filter = {};

				if (ctx.params.date) {
					filter.date = ctx.params.date;
				} else {
					filter = {
						author : this.personService.decodeID(ctx.params.user_code)
						, week : ctx.params.week
					};
				}
				
				let query = Review.find(filter);

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
			cache: true
			, handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);
			
			let comment = new Comment({
				description: ctx.params.description
				, work: ctx.params.work_code ? this.workService.decodeID(ctx.params.work_code) : null
				, review: ctx.params.review_code ? this.reviewService.decodeID(ctx.params.review_code) : null
				, author : ctx.user.id
			});

			return comment.save()
				.then(doc => {
					if (doc.work) {
						Work.findById(doc.work).exec()
							.then(workDoc => {
								if (workDoc.comments == null) {
									workDoc.comments = [doc.id];
								} else {
									workDoc.comments.push(doc.id);
								}
								workDoc.save();
							});
					} else if (doc.review) {
						Review.findById(doc.review).exec()
							.then(reviewDoc => {
								if (reviewDoc.comments == null) {
									reviewDoc.comments = [doc.id];
								} else {
									reviewDoc.comments.push(doc.id);
								}
								reviewDoc.save();
							});
					}
				
					// あくまでworkのdocを返すこと
					return doc;
				})
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
			// TODO							
		}

		, remove(ctx) {
			// TODO	
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
			if (strictMode || ctx.hasParam("description"))
				ctx.validateParam("description").trim().notEmpty(ctx.t("app:CommentDescriptionCannotBeBlank")).end();
			
			// if (strictMode || (ctx.hasParam("work_code") || ctx.hasParam("review_code")))
			// 	ctx.validateParam("work_code").trim().notEmpty(ctx.t("app:ReviewDateCannotBeBlank")).end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	}

	, init(ctx) {
		// Fired when start the service
		this.workService = ctx.services("works");
		this.reviewService = ctx.services("reviews");
	}

	, socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	}

	, graphql: {

		query: `
			comments(limit: Int, offset: Int, sort: String): [Comment]
			comment(code: String): Comment
		`

		, types: `
			type Comment {
				code: String!
				purpose: String
				type: String
				name: String
				goal: String
				status: Int
				lastCommunication: Timestamp
			}
		`

		, mutation: `
            commentCreate(name: String!, purpose: String, type: String, goal: String, status: Int): Comment
			commentUpdate(code: String!, name: String, purpose: String, type: String, goal: String, status: Int): Comment
			commentRemove(code: String!): Comment
		`

		, resolvers: {
			Query: {
				comments: "find"
				, comment: "get"
			}

			, Mutation: {
				commentCreate: "create"
				, commentUpdate: "update"
				, commentRemove: "remove"
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