import {
	SET_REVIEWING_DAY
	, LOAD_WORKS
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	reviewingDay: null
	, works: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	reviewingDay(state) { return state.reviewingDay; }
	, works(state) {return state.works; }
};

// mutationにはstateを変更する処理を実装する。
// mutationは同期でなければならない。

const mutations = {
	[SET_REVIEWING_DAY] (state, day) {
		state.reviewingDay = day;
	}
	, [LOAD_WORKS] (state, models) {
		state.works.slice(0);
		state.works.push(...models);
	}
};


import { createWork, readWorks, updateWork, deleteWork } from "../common/actions/works";
import { createReview, readReviews, updateReview } from "../common/actions/reviews";

export default {
	namespaced : true
	, state
	, getters
	, actions : { readWorks }
	, mutations
};