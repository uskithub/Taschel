
"use strict";

let logger 			= require("../../../../core/logger");
let config 			= require("../../../../config");
let C 	 			= require("../../../../core/constants");

let _				= require("lodash");

const Pdca 			= require("../../application/pdca");

let WorkRepository 	= require("../../infrastructure/repositories/monogodb/workRepository");
let TaskRepository 	= require("../../infrastructure/repositories/monogodb/taskRepository");


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
							return pdca.getEventsFromGoogleCalendar(week)
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

			const newWork = {
				title: ctx.params.title
				, start: ctx.params.start
				, end: ctx.params.end
				, week: ctx.params.week
				, parent: this.taskService.decodeID(ctx.params.parent_code)
				, author : ctx.user.id
				, asignee : ctx.user.id
			};
			
			const pdca = new Pdca(ctx);
			return pdca.ワークを追加する(newWork)
				.then(doc => {
					pdca.addEventToGoogleCalendar(doc);
					return this.toJSON(doc);
				})
				.then(json => {
					return this.populateModels(json);
				});
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:WorkNotFound"));
			this.validateParams(ctx);

			const valuesForUpdate = Object.keys(WorkRepository.schema.obj)
				.reduce((valuesForUpdate, key) => {
					const value = ctx.params[key];
					if (value) { 
						switch (key) {
						case "parent": {
							valuesForUpdate[key] = this.taskService.decodeID(value);
							break;
						}
						case "author": {
							valuesForUpdate[key] = this.personService.decodeID(value.code);
							break;
						}
						case "asignee": {
							valuesForUpdate[key] = this.personService.decodeID(value);
							break;
						}
						default:
							valuesForUpdate[key] = value;
							break;
						}
						
					}
					return valuesForUpdate;
				}, {});

			console.log("&&&", valuesForUpdate);

			const pdca = new Pdca(ctx);
			return pdca.ワークを編集する(ctx.modelID, valuesForUpdate)
				.then(doc => {
					return this.toJSON(doc);
				})
				.then(json => {
					return this.populateModels(json);
				});
		}

		// removing the model and updating the parent task.
		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:WorkNotFound"));

			const pdca = new Pdca(ctx);
			const parentTaskId = this.taskService.decodeID(ctx.model.parent);
			return pdca.ワークを削除する(ctx.modelID, parentTaskId)
				.then(taskDoc => {
					// taskDocを このWorkのPresenterでpopulateModelsしないこと。WorkのmodelPropFilterがあたったりしておかしくなる
					return {};
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
