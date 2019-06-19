"use strict";

let logger 				= require("../../../../core/logger");
let config 				= require("../../../../config");
let C 	 				= require("../../../../core/constants");
let slack				= require("../../../../applogic/libs/slack");

let _					= require("lodash");

const Pdca 			= require("../../application/pdca");

let WeeklyReviewRepository	= require("../../infrastructure/repositories/monogodb/weeklyReviewRepository");
let ReviewItemRepository	= require("../../infrastructure/repositories/monogodb/reviewItemRepository");
let ReviewRepository	= require("../../infrastructure/repositories/monogodb/reviewRepository");
let WorkRepository		= require("../../infrastructure/repositories/monogodb/workRepository");

module.exports = {
	settings: {
		name: "weeklyReviews"
		, version: 1
		, namespace: "weeklyReviews"
		, rest: true
		, ws: false
		, graphql: false
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: WeeklyReviewRepository
		, modelPropFilter: "code week items author createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			"items": "reviewItems"	// reviewItems は presenter（service）がないので populateModels で populate されない
			, "author": "persons"
		}
		, idEncodes: {
			// "works": "works"
			// "author": "persons"
		}
	}
	
	, actions: {
		find: {
			cache: true
			, handler(ctx) {
				const week = ctx.params.week;
				if (week) {
					const pdca = new Pdca(ctx);
					return pdca.自分のその週の週次レビューを取得する(week)
						.then(docs => {
							const doc = docs[0];
							// reviewItems は presenter（service）がないので populateModels で populate されないので自前でやる
							const promises = doc.items.map(itemId => ReviewItemRepository.findById(itemId).exec());
							return Promise.all(promises)
								.then(itemDocs => {
									// TODO: 内包するWorkやReviewもPopulateしないと。。。
									doc.items = itemDocs;
									return this.toJSON(doc);
								});
						})
						.then(json => {
							return this.populateModels(json);
						})
						.then(json => {
							console.log("%%%", json);
							return json;
						});
				}
			}
		}

		// return a model by ID
		, get: {
			cache: false
			, handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);

			const type = ctx.params.type;
			const weeklyReview = ctx.params.weeklyReview;
            
			const newItem = {
				week: ctx.params.week
				, type : type
				, work: (type === "work") ? this.workService.decodeID(ctx.params.item) : undefined
				, review: (type === "review") ? this.reviewService.decodeID(ctx.params.item) : undefined
				, author : ctx.user.id
			};
			
			const pdca = new Pdca(ctx);
			return pdca.レビュー対象を選択する(newItem)
				.then(itemDoc => {
					if (weeklyReview) {
						return pdca.週次レビューにレビュー対象を追加する(weeklyReview, itemDoc.id);
					} else {
						const newReview = {
							week: ctx.params.week
							, items: [ itemDoc.id ]
							, author : ctx.user.id
						};
						return pdca.週次レビューを追加する(newReview);
					}
				})
				.then(weeklyReviewDoc => {
					// weeklyReviewのdocを返す
					return this.toJSON(weeklyReviewDoc);
				})
				.then(json => {
					return this.populateModels(json);
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

			return WorkRepository.remove({ _id: ctx.modelID })
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
                
			// if (strictMode || ctx.hasParam("date"))
			// 	ctx.validateParam("date").trim().notEmpty(ctx.t("app:ReviewDateCannotBeBlank")).end();
                
			// if (strictMode || ctx.hasParam("works"))
			// 	ctx.validateParam("works").notEmpty(ctx.t("app:ReviewworksCannotBeBlank")).end();
                
			// if (strictMode || ctx.hasParam("highOrderAwakening"))
			// 	ctx.validateParam("highOrderAwakening").trim().notEmpty(ctx.t("app:ReviewHighOrderAwakeningCannotBeBlank")).end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	}

	, init(ctx) {
		// Fired when start the service
		this.reviewItemService = ctx.services("reviewItems");
		this.personService = ctx.services("persons");
	}
};
