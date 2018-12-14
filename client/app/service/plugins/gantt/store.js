import Vue from "vue";
import Vuex from "vuex";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	foldingConditionMap: {}
};

const getters = {
	foldingConditionMap(state) { return state.foldingConditionMap; }
};

const mutations = {
	updateFoldingCondition(state, { id, newValue }) {
		// Objectのプロパティを変更した際もReactiveにするためにはVue.setを使う
		Vue.set(state.foldingConditionMap, id, newValue);
	}
};

const actions = {

};

Vue.use(Vuex);

export default new Vuex.Store({
	namespaced : true
	, state
	, getters
	, actions
	, mutations
});