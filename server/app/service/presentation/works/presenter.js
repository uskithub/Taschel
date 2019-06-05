
"use strict";

let logger 			= require("../../../../core/logger");
let config 			= require("../../../../config");
let C 	 			= require("../../../../core/constants");

let _				= require("lodash");
let moment 			= require("moment");
let base32Encode	= require("base32-encode");
let base32Decode	= require("base32-decode");
let google			= require("googleapis");

let Workepository 	= require("../../infrastructure/repositories/workRepository");
let TaskRepository 	= require("../../infrastructure/repositories/taskRepository");

const clientID 		= config.authKeys.google.clientID;
const clientSecret	= config.authKeys.google.clientSecret;
const redirectUrl	= "/auth/google/callback";
const OAuth2		= google.auth.OAuth2;

const EVENT_ID_PREFIX = "taschel:";
const CALENDAR_SOURCE_ID = "Taschel";

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
		, collection: Workepository
		
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
				let filter = {};

				if (ctx.params.date) {
					const start = moment(ctx.params.date).format();
					const end = moment(ctx.params.date).add(1, "d").format();
					filter.start = {
						"$gte" : start, "$lt" : end
					};

					let query = Workepository.find(filter);
					return ctx.queryPageSort(query).exec().then(docs => {
						return this.toJSON(docs);
					})
						.then(json => {
							return this.populateModels(json);
						});
				} else if (ctx.params.week) {
					const userId = ctx.params.user_code ? this.personService.decodeID(ctx.params.user_code) : null;
					filter = {
						asignee : userId
						, week : ctx.params.week
					};
					let query = Workepository.find(filter);

					return ctx.queryPageSort(query).exec()
						.then(docs => {
							return this.toJSON(docs);
						})
						.then(json => {	
							return this.populateModels(json);
						})
						.then(json => {
							if (userId) {
								return this.personService.collection.findById(userId).exec()
									.then(doc => {
										if (doc.credentials.access_token) {
											let week = moment(ctx.params.week);
											const min = week.format();
											const max = week.add(5, "d").format();
			
											console.log(min, max);

											let oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);
											oauth2Client.credentials = doc.credentials;
				
											let calendar = google.calendar("v3");
											// @see https://github.com/google/google-api-nodejs-client/blob/master/src/apis/calendar/v3.ts#L1025
		
											return new Promise((resolve, reject) => {
		
												calendar.events.list({
													// Auth client or API Key for the request
													// auth?: string|OAuth2Client|JWT|Compute|UserRefreshClient;
													auth: oauth2Client
													, calendarId: "primary"
													, timeMax: max
													, timeMin: min
													, maxResults: 10
													, singleEvents: true
													, orderBy: "startTime"
												}
												, (err, response) => {
													if (err) {
														return reject(err);
													}
													return resolve(response.data.items);
												});
											}).then(items => {
												// Taschelで追加したイベントが重複して表示されないようにしている
												items.forEach(item => {

													if (item.source && item.source.title == CALENDAR_SOURCE_ID) {
														// an event is made by taschel.
														let eventId = String.fromCharCode.apply("", new Uint8Array(base32Decode((item.id	).toUpperCase(), "RFC4648-HEX")));
														let workId = eventId.replace(EVENT_ID_PREFIX, "");

														// TODO: jsonの中身と比べて、Googleカレンダー側で更新されていたら、workを更新
														let work = json.find(j => this.decodeID(j.code) == workId);
														console.log("■□■", work, item);
												
													} else {
														// TODO: Google Caldndarで追加したイベントにも振り返りを可能にする

														// Google Calendarで作成した予定だけ追加
														json.push({
															code: "GOOGLE_CALENDAR"
															, title: item.summary
															, start: item.start.dateTime
															, end: item.end.dateTime
															, week: ctx.params.week
														});
													}
												});
												return json;
											});
										} else {
											return json;
										}
									});
							} else {
								return json;
							}
						});
				} else {
					// for timeline
					filter = {
						
					};

					let query = Workepository.find().sort({ updatedAt : -1 }).skip(0).limit(10);

					return ctx.queryPageSort(query).exec()
						.then(docs => {
							return this.toJSON(docs);
						})
						.then(json => {	
							return this.populateModels(json);
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
			
			return Workepository.create({
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
