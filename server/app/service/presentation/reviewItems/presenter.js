"use strict";

let C 	 				= require("../../../../core/constants");

let ReviewItemRepository	= require("../../infrastructure/repositories/monogodb/reviewItemRepository");

module.exports = {
	settings: {
		name: "reviewItems"
		, version: 1
		, namespace: "reviewItems"
		, rest: false
		, ws: false
		, graphql: false
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: ReviewItemRepository
		, modelPropFilter: "code week type work review abstraction diversion author createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			"work": "works"
			, "review": "reviews"
			, "author": "persons"
		}
		, idEncodes: {
			// "works": "works"
			// "author": "persons"
		}
	}

	, init(ctx) {
		// Fired when start the service
	}
};
