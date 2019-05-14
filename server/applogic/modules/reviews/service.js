"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let slack		= require("../../libs/slack");

let _			= require("lodash");

let Review 		= require("./models/review");
let Work 		= require("../works/models/work");

module.exports = {
	settings: {
		name: "reviews"
		, version: 1
		, namespace: "reviews"
		, rest: true
		, ws: true
		, graphql: true
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: Review
		
		, modelPropFilter: "code week date works highOrderAwakening comments author createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			works: "works"
			, comments : "comments"
		}
		, idEncodes: {
			// "works": "works"
			"author": "persons"
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
			
			let review = new Review({
				week: ctx.params.week
				, date: ctx.params.date
				// , works: this.workService.decodeID(ctx.params.work_code)
				, highOrderAwakening: ctx.params.highOrderAwakening
				, works: ctx.params.works.map(code => { return this.workService.decodeID(code); })
				, author : ctx.user.id
			});

			return review.save()
				.then(doc => {
				// slackへのPOST用にworkを取得（後続処理に関係ない非同期処理）
					let filter = {
						_id : { $in : doc.works }
					};
					Work.find(filter).exec()
						.then(docs => {
							let message = docs.reduce((message, d) => {
								message += `:fencer: *${d.title}*\n`;
								message += `${d.description}\n`;
								if (d.goodSide != undefined && d.goodSide != "") { message += `> :blush: ${d.goodSide}\n`; }
								if (d.badSide != undefined && d.badSide != "") { message += `> :tired_face: ${d.badSide}\n`; }
								if (d.improvement != undefined && d.improvement != "") { message += `> :thinking_face: ${d.improvement}\n`; }
								message += "\n";
								return message;
							}, "");

							message += `→ \`${doc.highOrderAwakening}\``;

							// slack.postMessage(`${ctx.user.username} の ${doc.date} のレビュー:sparkles:\n ${message}`);
						});
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
					//slack.postMessage(`${ctx.user.username} が日次レビューをした！`);
					return json;
				});
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:ReviewNotFound"));
			this.validateParams(ctx);

			return this.collection.findById(ctx.modelID).exec()
				.then(doc => {

					if (ctx.params.highOrderAwakening != null)
						doc.highOrderAwakening = ctx.params.highOrderAwakening;
					
					if (ctx.params.works.length > doc.works.length)
						doc.works = ctx.params.works.map(code => { return this.workService.decodeID(code); });

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
			if (strictMode || ctx.hasParam("week"))
				ctx.validateParam("week").trim().notEmpty(ctx.t("app:ReviewWeekCannotBeBlank")).end();
                
			if (strictMode || ctx.hasParam("date"))
				ctx.validateParam("date").trim().notEmpty(ctx.t("app:ReviewDateCannotBeBlank")).end();
                
			if (strictMode || ctx.hasParam("works"))
				ctx.validateParam("works").notEmpty(ctx.t("app:ReviewworksCannotBeBlank")).end();
                
			if (strictMode || ctx.hasParam("highOrderAwakening"))
				ctx.validateParam("highOrderAwakening").trim().notEmpty(ctx.t("app:ReviewHighOrderAwakeningCannotBeBlank")).end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	}

	, init(ctx) {
		// Fired when start the service
		this.workService = ctx.services("works");
		this.personService = ctx.services("persons");
	}

	, socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	}

	, graphql: {

		query: `
			reviews(limit: Int, offset: Int, sort: String): [Review]
			review(code: String): Review
		`

		, types: `
			type Review {
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
            reviewCreate(name: String!, purpose: String, type: String, goal: String, status: Int): Review
			reviewUpdate(code: String!, name: String, purpose: String, type: String, goal: String, status: Int): Review
			reviewRemove(code: String!): Review
		`

		, resolvers: {
			Query: {
				reviews: "find"
				, review: "get"
			}

			, Mutation: {
				reviewCreate: "create"
				, reviewUpdate: "update"
				, reviewRemove: "remove"
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