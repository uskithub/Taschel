
"use strict";

let logger 			= require("../../../../core/logger");
let config 			= require("../../../../config");
let C 	 			= require("../../../../core/constants");

let _				= require("lodash");

let base32Encode	= require("base32-encode");


const Pdca 			= require("../../application/pdca");

let WorkRepository 	= require("../../infrastructure/repositories/workRepository");
let TaskRepository 	= require("../../infrastructure/repositories/taskRepository");


module.exports = {
	settings: {
		name: "works"
		, version: 1
		, namespace: "works"
		, rest: true
		, ws: false
		, graphql: false
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: WorkRepository
		
		, modelPropFilter: "code goal title start end actualStart actualEnd description week parent goodSide badSide improvement comments author status asignee lastCommunication createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			"comments" : "comments"
			, "author": "persons"
		}
		, idEncodes: {
			"parent": "tasks"
			, "asignee": "persons"
		}
	}
	
	, actions: {
		find: {
			cache: true
			, handler(ctx) {
				const week = ctx.params.week;
				if (week) {
					const pdca = new Pdca(ctx);
					return pdca.自分のその週のワーク一覧を取得する(week)
						.then(docs => {
							return this.toJSON(docs);
						})
						.then(json => {
							return this.populateModels(json);
						})
						.then(json => {
							return pdca.Googleカレンダーからイベントを取得する(week)
								.then(({ google, taschel }) => {
									return json.concat(google);
								});
						});
				}
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
			
			return WorkRepository.create({
				title: ctx.params.title
				, start: ctx.params.start
				, end: ctx.params.end
				, week: ctx.params.week
				, parent: this.taskService.decodeID(ctx.params.parent_code)
				, author : ctx.user.id
				, asignee : ctx.user.id
			}).then(doc => {
				// 親のTaskに追加（本来Promiseだが、待つ必要がないので非同期処理）
				TaskRepository.findById(doc.parent).exec()
					.then(taskDoc => {
						if (taskDoc.works == null) {
							taskDoc.work = [doc.id];
						} else {
							taskDoc.works.push(doc.id);
						}
						taskDoc.save();
					});

				// Google Calendarに追加
				const userId = ctx.user.id;

				if (userId) {
					// 本来Promiseだが、待つ必要がないので非同期処理
					this.personService.collection.findById(userId).exec()
						.then(userDoc => {
							if (userDoc.credentials.access_token) {
								let oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);
								oauth2Client.credentials = userDoc.credentials;

								let calendar = google.calendar("v3");
								// @see https://github.com/google/google-api-nodejs-client/blob/master/src/apis/calendar/v3.ts#L3433
			
								return new Promise((resolve, reject) => {

									let idEncoded = base32Encode(Uint8Array.from(Buffer.from(`${EVENT_ID_PREFIX}${doc.id}`)), "RFC4648-HEX", { padding: false }).toLowerCase();

									console.log("****** 来てる");

									calendar.events.insert(
										// params: Params$Resource$Events$Insert
										{ 
											// Auth client or API Key for the request
											// auth?: string|OAuth2Client|JWT|Compute|UserRefreshClient;
											auth: oauth2Client
											, calendarId: "primary"
											, resource: {
												// required
												start: { dateTime: ctx.params.start }
												, end: { dateTime: ctx.params.end }
												// optional
												, id : idEncoded
												, summary : doc.title
												, colorId : "2"
												// , description: ""
												, source : {
													title : CALENDAR_SOURCE_ID
													, url : "https://taschel.com/"
												}
											}
										}
										// callback: BodyResponseCallback<Schema$Event>
										, (err, response) => {
											if (err) {
												console.log("●●●●●", err);
												return reject(err);
											}
											console.log("●●◯●●", response.data.items);
											return resolve(response.data.items);
										});
								});
							}
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
			ctx.assertModelIsExist(ctx.t("app:WorkNotFound"));
			this.validateParams(ctx);

			return this.collection.findById(ctx.modelID).exec()
				.then(doc => {
					if (ctx.params.goal != null)
						doc.goal = ctx.params.goal;

					if (ctx.params.start != null)
						doc.start = ctx.params.start;

					if (ctx.params.end != null)
						doc.end = ctx.params.end;

					if (ctx.params.actualStart != null)
						doc.actualStart = ctx.params.actualStart;

					if (ctx.params.actualEnd != null)
						doc.actualEnd = ctx.params.actualEnd;

					if (ctx.params.description != null)
						doc.description = ctx.params.description;

					if (ctx.params.status != null)
						doc.status = ctx.params.status;

					if (ctx.params.goodSide != null)
						doc.goodSide = ctx.params.goodSide;

					if (ctx.params.badSide != null)
						doc.badSide = ctx.params.badSide;

					if (ctx.params.improvement != null)
						doc.improvement = ctx.params.improvement;

					return doc.save();
				})
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
				//this.notifyModelChanges(ctx, "updated", json);
					return json;
				});								
		}

		// removing the model and updating the parent task.
		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:WorkNotFound"));

			return Workepository.remove({ _id: ctx.modelID })
				.then(() => {
					return ctx.model;
				})
				.then(json => {
					return TaskRepository.findById(this.taskService.decodeID(json.parent)).exec()
						.then(taskDoc => {
							taskDoc.works = taskDoc.works.filter(id => { return id != ctx.modelID; });
							return taskDoc.save();
						})
						.then(doc => {
							this.notifyModelChanges(ctx, "removed", json);
							return json;
						});		
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
};
