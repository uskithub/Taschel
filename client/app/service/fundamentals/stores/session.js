import User from "../entities/user";
import Project from "../entities/project";
import profile from "./profile";
import organization from "./organization";
import { ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH, PUSH_CRUMB, POP_CRUMB, SET_WAY_BACK, CLEAR_CRUKB, LOAD_PROJECTS, UPDATE_PROJECT, SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../mutationTypes";
import { assign } from "lodash";

// DDD: 集約ルート
const state = {
	// DDD: Entities
	user: null
	, notifications: [
		// { id: 1, text: "Something happened!", time: 1, user: null }
	]
	, messages: []
	, searchText: ""
	, breadcrumb: []
	, projects: []
	// user.code
	, currentUserId: null
	// YYYY-MM-DD（moment().day(1).format("YYYY-MM-DD")）
	, currentWeek: null
	// current project entity
	, currentProject: null
};

const getters = {
	me(state) { return state.user; }
	, notifications(state) { return state.notifications; }
	, messages(state) { return state.messages; }
	, searchText(state) { return state.searchText; }
	, breadcrumb(state) { return state.breadcrumb; }
	, projects(state) { return state.projects; }
	, currentUserId(state) { return state.currentUserId; }
	, currentWeek(state) { return state.currentWeek; }
	, currentProject(state) { return state.currentProject; }
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
	, [SET_USER] (state, userRawValues) {
		state.user = new User(userRawValues);
		if (state.currentUser === null) {
			state.currentUser = state.user.id;
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
	, [LOAD_PROJECTS] (state, rawValuesArr) {
		state.projects.splice(0);
		state.projects.push(...rawValuesArr.map(rawValues => {
			return new Project(rawValues);
		}));
	}
	, [UPDATE_PROJECT] (state, rawValues) {
		state.projects.forEach(p => {
			if (p.code === rawValues.code) {
				assign(p, new Project(rawValues));
			}
		});
	}
	, [SET_CURRENT_PROJECT] (state, entity) {
		state.currentProject = entity;
	}
	, [CLEAR_SELECTION] (state) {
		state.currentProject = null;
	}
};

import tasks from "./actions/rest/tasks";
import sessions from "./actions/rest/sessions";

export default {
	namespaced: true
	, state
	, getters
	, actions : {
		getCurrentSession : sessions.get
		, getUserProjectList : tasks.curriedGet({ 
			preservedOptions: { taskType : "project" }
			, preservedMutation: LOAD_PROJECTS
		})
		, updateProject : tasks.curriedPut({ 
			preservedMutation: UPDATE_PROJECT
		})
	}
	, mutations
	, modules: {
		profile
		, organization
	}
};