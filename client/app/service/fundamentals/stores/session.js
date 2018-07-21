import User from "../entities/user";
import Project from "../entities/project";
import Task from "../entities/task";
import profile from "./profile";
import organization from "./organization";
import breadcrumb from "./breadcrumb";
import backlog from "./backlog";
import pdca from "./pdca";
import { INITIALIZE, ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH, SET_CURRENT_WEEK, LOAD_PROJECTS, ADD_PROJECT, UPDATE_PROJECT, ADD_TASK_TO_PROJECT, SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../mutationTypes";
import moment from "moment";
import { assign } from "lodash";

import tasks from "../repositories/rest/tasks";
import sessions from "../repositories/rest/sessions";

// DDD: Application Service
export default {
	modules: {
		// for Application
		backlog
		, pdca
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
		, currentProjectRef: null
	}
	, getters : {
		me(state) { return state.user; }
		, projects(state) { return state.projects; }
		, currentWeek(state) { return state.currentWeek; }

		, notifications(state) { return state.notifications; }
		, messages(state) { return state.messages; }
		, searchText(state) { return state.searchText; }
		, currentUserId(state) { return state.currentUserId; }
		, currentProject(state) { return state.currentProjectRef; }
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
		, [SET_CURRENT_PROJECT] (state, entity) {
			state.currentProjectRef = entity;
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
		, [ADD_TASK_TO_PROJECT] (state, task) {
			const findParentRecursively = (targetTask, newTask) => {
				console.log(targetTask);
				if (targetTask.code === newTask.parent) {
					targetTask.addChild(newTask);
					return true;
				} else {
					let tasks = targetTask.tasks;
					for (let i=0, len=tasks.length; i<len; i++) {
						if (findParentRecursively(tasks[i], newTask)) {
							return true;
						}
					}
					return false;
				}
			};
			
			findParentRecursively(state.currentProjectRef, task);
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
		, [SET_CURRENT_WEEK] (state, entity) {
			state.currentWeek = entity;
		}
		, [CLEAR_SELECTION] (state) {
			state.currentProject = null;
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// This action calls all modules INITIALIZE mutations.
		initialize({ commit }) {
			commit(INITIALIZE);
		}
		, getCurrentSession({ commit }) {
			return sessions.get()
				.then(data => {
					let user = new User(data);
					commit(SET_USER, user);
				});
		}
		// Usecase:
		, changeWeek({ commit }, week) {
			return Promise.resolve()
				.then(() => {
					commit(SET_CURRENT_WEEK, week);
				});
		}
		// Usecase: a user watches the list of the projects that he/she is owner or joins.
		, getUserProjectList({ commit, getters }, { options } = {}) {
			const savedCurrentProject = getters.currentProject ? getters.currentProject.code : null;

			let user = getters.me;
			options = assign({ taskType : "project", user : user.code }, options);

			return tasks.get(options)
				.then(data => {
					let projects = data.map(rawValues => {
						return new Project(rawValues);
					});
					commit(LOAD_PROJECTS, projects);
				})
				.then(() => {
					// select current project
					if (savedCurrentProject === null) {
						for (let i=0, len = getters.projects.length; i<len; i++) {
							let p = getters.projects[i];
							if (p.author.code === user.code) {
								commit(SET_CURRENT_PROJECT, p);
								return;
							}
						}
						commit(SET_CURRENT_PROJECT, getters.projects[0]);
					} else {
						for (let i=0, len = getters.projects.length; i<len; i++) {
							let p = getters.projects[i];
							if (p.code === savedCurrentProject) {
								commit(SET_CURRENT_PROJECT, p);
								return;
							}
						}
					}
				});
		}
		// Usecase: a user selects a project for editing.
		, selectProject({ commit }, project) {
			commit(SET_CURRENT_PROJECT, project);
		}
		// Usecase: a user completes adding a new project.
		, createProject({ commit, getters }, rawValues) {
			let user = getters.me;
			rawValues = assign({ type: "project", author : user.code }, rawValues);
			return tasks.post(rawValues)
				.then(data => {
					let project = new Project(rawValues);
					commit(ADD_PROJECT, project);
				});
		}
		// Usecase: a user completes editing a project.
		, editProject({ commit }, rawValues) {
			return tasks.put(rawValues)
				.then(data => {
					let project = new Project(rawValues);
					commit(UPDATE_PROJECT, project);
				});
		}
		// TODO: 以下をplanningとして切り出す
		// Usecase:
		, addTaskToProject({ commit }, rawValues) {
			return tasks.post(rawValues)
				.then(data => {
					let task = new Task(data);
					// TODO: 既存のtasksのどこに突っ込むか（ソート、フィルタとか）
					commit(ADD_TASK_TO_PROJECT, task);
				});
		}
		, arrangeTasksInAnotherTask({ dispatch, commit, getters }, { task, from, to, index }) {
			console.log(task, from, to, index);

			return Promise.resolve()
				.then(() => {
					// Removing
					// you must execute removing before adding because of the index problem.
					if (from.code !== to.code) {
						let rawValues = from.entity.rawValues;
						let newChildren = rawValues.children.map(child => { return child.code; })
							.filter(code => { return code !== task.code; });

						return tasks.patch({ code: rawValues.code, children: newChildren });
					}
					return null;
				})
				.then(data => {
					// Adding
					// adding to "to" if "to" is not "UNCLASSIFIED".
					let rawValues = to.entity.rawValues;
					let newChildren = rawValues.children.map(child => { return child.code; })
						.filter(code => { return code !== task.code; });
					newChildren.splice(index, 0, task.code);

					return tasks.patch({ code: rawValues.code, children: newChildren });
				})
				.then(data => {
					// modify parent
					return tasks.patch({ code: task.code, parent: to.code });
				})
				.then(data => {
					// refresh
					return dispatch("getUserProjectList");
				});
		}
	}
};