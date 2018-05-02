import Vue from "vue";
import { METHOD, api } from "../../../system/fundamentals/api";
import { ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH, PUSH_CRUMB, POP_CRUMB, SET_WAY_BACK, CLEAR_CRUKB, LOAD_PROJECTS, SELECT_PROJECT, CLEAR_SELECTION } from "../mutationTypes";

const NAMESPACE= "/api/session";

const state = {
	user: null
	, notifications: [
		// { id: 1, text: "Something happened!", time: 1, user: null }
	]
	, messages: []
	, searchText: ""
	, breadcrumb: []
	, projects: []
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
	, breadcrumb(state) { return state.breadcrumb; }
	, projects(state) { return state.projects; }
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
	, [PUSH_CRUMB] (state, crumb) {
		state.breadcrumb.push(crumb);
		console.log("crumb", state.breadcrumb);
	}
	, [POP_CRUMB] (state) {
		return state.breadcrumb.pop();
	}
	, [SET_WAY_BACK] (state, func) {
		if (state.breadcrumb.length > 0) {
			state.breadcrumb[state.breadcrumb.length-1].back = () => {
				func();
				state.breadcrumb[state.breadcrumb.length-1].back = null;
			};
		}
	}
	, [CLEAR_CRUKB] (state) {
		state.breadcrumb.splice(0);
	}
	, [LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state.projects.push(...models);
	}
	, [SELECT_PROJECT] (state, row) {
		state.currentProject = row;
	}
	, [CLEAR_SELECTION] (state) {
		state.currentProject = null;
	}
};

export default {
	namespaced: true
	, state
	, getters
	, actions
	, mutations
};