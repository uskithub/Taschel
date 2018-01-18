import {
	SET_REVIEWING_DAY
	, LOAD_WORKS
	, LOAD_REVIEWS
	, ADD_COMMENT
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	reviewingDay: null
	, works: []
	, reviews: []
};

const getters = {
	reviewingDay(state) { return state.reviewingDay; }
	, works(state) {return state.works; }
	, reviews(state) {return state.reviews; }
};

const mutations = {
	[SET_REVIEWING_DAY] (state, day) {
		state.reviewingDay = day;
	}
	, [LOAD_WORKS] (state, models) {
		state.works.splice(0);
		state.works.push(...models);
	}
	, [LOAD_REVIEWS] (state, models) {
		state.reviews.splice(0);
		state.reviews.push(...models);
	}
	, [ADD_COMMENT] (state, model) {
		if (model.work) {
			state.works.forEach(item => {
				if (item.code == model.work) {
					if (item.comments) { item.comments.push(model); }
					else { item.comments = [model]; }
				}
			});
		} else if (model.review) {
			state.reviews.forEach(item => {
				if (item.code == model.review) {
					if (item.comments) { item.comments.push(model); }
					else { item.comments = [model]; }
				}
			});
		}
	}
};

import { createWork, readWorks, updateWork, deleteWork } from "../common/actions/works";
import { createReview, readReviews, updateReview } from "../common/actions/reviews";
import { createComment } from "../common/actions/comments";

export default {
	namespaced : true
	, state
	, getters
	, actions : { readWorks, readReviews, createComment }
	, mutations
};