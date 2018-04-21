import Vue from "vue";
import { METHOD, api } from "../../../system/fundamentals/api";
import { ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH } from "../mutationTypes";

const NAMESPACE= "/api/session";

const state = {
	user: null
	, notifications: [
		// { id: 1, text: "Something happened!", time: 1, user: null }
	]
	, messages: []
	, searchText: ""
	// user.code
	, currentUser: null
	// YYYY-MM-DD（moment().day(1).format("YYYY-MM-DD")）
	, currentWeek: null
	// task.code 
	, currentProject: null
};

const getters = {
	me(state) { return state.user; }
	, notifications(state) { return state.notifications; }
	, messages(state) { return state.messages; }
	, searchText(state) { return state.searchText; }
	, currentUser(state) { return state.currentUser; }
	, currentWeek(state) { return state.currentWeek; }
	, currentProject(state) { return state.currentProject; }
};

const actions = {
	getSessionUser({ commit }) {
		return api(METHOD.get, `${NAMESPACE}/me`)
			.then(data => {
				commit(SET_USER, data);
			});
	}
};

const mutations = {
	[ADD_MESSAGE] (state, item) {
		state.messages.splice(0);
		state.messages.push(item);
	}
	, [ADD_NOTIFICATION] (state, item) {
		state.notifications.splice(0);
		state.notifications.push(item);
	}
	, [SET_USER] (state, user) {
		state.user = user;
		if (state.currentUser === null) {
			state.currentUser = user.code;
		}
	}
	, [SEARCH] (state, text) {
		state.searchText = text;
	}	
};

export default {
	namespaced: true
	, state
	, getters
	, actions
	, mutations
};