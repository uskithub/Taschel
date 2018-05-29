import User from "../entities/user";
import Project from "../entities/project";
import profile from "./profile";
import organization from "./organization";
import { ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH, PUSH_CRUMB, POP_CRUMB, SET_WAY_BACK, CLEAR_CRUKB, LOAD_PROJECTS, UPDATE_PROJECT, SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../mutationTypes";
import { assign } from "lodash";

import tasks from "../repositories/rest/tasks";
import sessions from "../repositories/rest/sessions";

// DDD: Application Service
export default {
	namespaced: true
	, modules: {
		profile
		, organization
	}
	, state : {
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
	}
	, getters : {
		me(state) { return state.user; }
		, notifications(state) { return state.notifications; }
		, messages(state) { return state.messages; }
		, searchText(state) { return state.searchText; }
		, breadcrumb(state) { return state.breadcrumb; }
		, projects(state) { return state.projects; }
		, currentUserId(state) { return state.currentUserId; }
		, currentWeek(state) { return state.currentWeek; }
		, currentProject(state) { return state.currentProject; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations :  {
		[SET_USER] (state, user) {
			state.user = user;
			if (state.currentUser === null) {
				state.currentUser = state.user.code;
			}
		}
		, [LOAD_PROJECTS] (state, projects) {
			state.projects.splice(0);
			state.projects.push(...projects);
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
		getCurrentSession : ({ commit }) => {
			return sessions.get()
				.then(data => {
					let user = new User(data);
					commit(SET_USER, user);
				});
		}

		// Usecase: a user watches the list of the projects that he/she is owner or joins.
		, getUserProjectList : ({ commit }, { options }) => {
			options = assign({ taskType : "project" }, options);
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
		, createProject : ({ commit }, rawValues) => {
			// TODO
			return Promise.resolve();
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