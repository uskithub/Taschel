import User from "../entities/user";
import Project from "../entities/project";
import profile from "./profile";
import organization from "./organization";
import breadcrumb from "./breadcrumb";
import task from "./task";
import { INITIALIZE, ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH, PUSH_CRUMB, POP_CRUMB, SET_WAY_BACK, CLEAR_CRUMB, LOAD_PROJECTS, ADD_PROJECT, UPDATE_PROJECT, SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../mutationTypes";
import moment from "moment";
import { assign } from "lodash";

import tasks from "../repositories/rest/tasks";
import sessions from "../repositories/rest/sessions";

// DDD: Application Service
export default {
	modules: {
		// for Application
		task
		, profile
		, organization

		// for Presentation
		, breadcrumb
	}
	, state : {
		// DDD: Entities
		user: null
		, projects: []

		// YYYY-MM-DD（moment().day(1).format("YYYY-MM-DD")）
		, currentWeek: (() => { return moment().day(1).format("YYYY-MM-DD"); })()


		, notifications: [
			// { id: 1, text: "Something happened!", time: 1, user: null }
		]
		, messages: []
		, searchText: ""
		
		// user.code
		, currentUserId: null
		// current project entity
		, currentProject: null
	}
	, getters : {
		me(state) { return state.user; }
		, projects(state) { return state.projects; }
		, currentWeek(state) { return state.currentWeek; }

		, notifications(state) { return state.notifications; }
		, messages(state) { return state.messages; }
		, searchText(state) { return state.searchText; }
		, currentUserId(state) { return state.currentUserId; }
		, currentProject(state) { return state.currentProject; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations :  {
		// Vuex: Don't use namespaced option with true, and must implement [INITIALIZE] mutation in each stores.
		[INITIALIZE] (state) {
			state.user = null;
			state.projects.splice(0);
		}
		, [SET_USER] (state, user) {
			state.user = user;
			if (state.currentUser === null) {
				state.currentUser = state.user.code;
			}
		}
		, [LOAD_PROJECTS] (state, projects) {
			state.projects.splice(0);
			state.projects.push(...projects);
		}
		, [ADD_PROJECT] (state, project) {
			let isFound = state.projects.find(p => p.code === project.code);
			if (!isFound) {
				state.projects.push(project);
			}
		}
		, [UPDATE_PROJECT] (state, project) {
			state.projects.forEach(p => {
				if (p.code === project.code) {
					assign(p, project);
				}
			});
		}
		, [ADD_MESSAGE] (state, item) {
			state.messages.splice(0);
			state.messages.push(item);
		}
		, [ADD_NOTIFICATION] (state, item) {
			state.notifications.splice(0);
			state.notifications.push(item);
		}
		, [SEARCH] (state, text) {
			state.searchText = text;
		}
		, [SET_CURRENT_PROJECT] (state, entity) {
			state.currentProject = entity;
		}
		, [CLEAR_SELECTION] (state) {
			state.currentProject = null;
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// This action calls all modules INITIALIZE mutations.
		initialize : ({ commit }) => {
			commit(INITIALIZE);
		}
		, getCurrentSession : ({ commit }) => {
			return sessions.get()
				.then(data => {
					let user = new User(data);
					commit(SET_USER, user);
				});
		}

		// Usecase: a user watches the list of the projects that he/she is owner or joins.
		, getUserProjectList : ({ commit, getters }, { options } = {}) => {
			let user = getters.me;
			options = assign({ taskType : "project", user : user.code }, options);
			return tasks.get(options)
				.then(data => {
					let projects = data.map(rawValues => {
						return new Project(rawValues);
					});
					commit(LOAD_PROJECTS, projects);
				});
		}
		// Usecase: a user selects a project for editing.
		, selectProject : ({ commit }, project) => {
			commit(SET_CURRENT_PROJECT, project);
		}
		
		// Usecase: a user completes adding a new project.
		, createProject : ({ commit, getters }, rawValues) => {
			let user = getters.me;
			rawValues = assign({ type: "project", author : user.code }, rawValues);
			return tasks.post(rawValues)
				.then(data => {
					let project = new Project(rawValues);
					commit(ADD_PROJECT, project);
				});
		}
		
		// Usecase: a user completes editing a project.
		, updateProject : ({ commit }, rawValues) => {
			return tasks.put(rawValues)
				.then(data => {
					let project = new Project(rawValues);
					commit(UPDATE_PROJECT, project);
				});
		}
	}
};