import User from "../entities/user";
import Project from "../entities/project";
import Task from "../entities/task";
import profile from "./profile";
import organization from "./organization";
import breadcrumb from "./breadcrumb";
import backlog from "./backlog";
import pdca from "./pdca";
import planning from "./planning";
import { INITIALIZE, GET_READY, ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH, SET_CURRENT_WEEK, LOAD_PROJECTS, ADD_PROJECT, UPDATE_PROJECT, CLOSE_PROJECT, ADD_TASK_TO_PROJECT, UPDATE_TASK_OF_CURRENT_PROJECT, SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../mutationTypes";
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
		, planning

		// for Presentation
		, breadcrumb
	}
	, state : {
		isReady: false

		// DDD: Entities
		, user: null
		, projects: []

		// YYYY-MM-DD（moment().day(1).format("YYYY-MM-DD")）
		// , currentWeek: (() => { return moment().day(1).format("YYYY-MM-DD"); })()
		, currentWeek: (() => { return moment().day(1); })()

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
		isReady(state) { return state.isReady; }
		
		, me(state) { return state.user; }
		, projects(state) { return state.projects; }
		, currentWeek(state) { return state.currentWeek; }
		, currentWeekOfMonth(state) { 
			const todayWeek = state.currentWeek.week();
			const firstDay = moment(state.currentWeek).startOf("month");
			const firstDayWeek = firstDay.week();
			const weekOfMonth = ((todayWeek > firstDayWeek) ? todayWeek - firstDayWeek : todayWeek - firstDayWeek + 52) + 1
			return `${ firstDay.format("YYYY年MM月") } 第${weekOfMonth}週`; 
		}

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
		, [GET_READY] (state) {
			state.isReady = true;
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
		, [CLOSE_PROJECT] (state, code) {
			state.projects = state.projects.filter(p => p.code != code);
		}
		, [ADD_TASK_TO_PROJECT] (state, task) {
			const findParentRecursivelyToAddChild = (targetTask, newTask) => {
				if (targetTask.code === newTask.parent) {
					targetTask.addChild(newTask);
					return true;
				} else {
					let tasks = targetTask.tasks;
					for (let i=0, len=tasks.length; i<len; i++) {
						if (findParentRecursivelyToAddChild(tasks[i], newTask)) {
							return true;
						}
					}
					return false;
				}
			};
			findParentRecursivelyToAddChild(state.currentProjectRef, task);
		}
		, [UPDATE_TASK_OF_CURRENT_PROJECT] (state, entity) {
			state.currentProjectRef.updateDescendant(entity);
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
		, changeWeek({ commit }, momentObj) {
			const m = momentObj.day(1);
			return Promise.resolve()
				.then(() => {
					commit(SET_CURRENT_WEEK, m);
				});
		}
		// Usecase: a user watches the list of the projects that he/she is owner or joins.
		, getUserProjectList({ commit, getters }, { options } = {}) {
			const savedCurrentProject = getters.currentProject ? getters.currentProject.code : null;

			const user = getters.me;
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
					let project = new Project(data);
					commit(ADD_PROJECT, project);
				});
		}
		// Usecase: a user completes editing a project.
		, editProject({ commit }, rawValues) {
			return tasks.put(rawValues)
				.then(data => {
					let project = new Project(data);
					commit(UPDATE_PROJECT, project);
				});
		}
		, closeProject({ commit }, rawValues) {
			rawValues.status = -1;
			return tasks.put(rawValues)
				.then(data => {
					commit(CLOSE_PROJECT, data.code);
				});
		}
		// TODO: 以下をplanningとして切り出す
		// Usecase:
		, addTaskToProject({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.post(rawValues)
				.then(data => {
					let task = new Task(data, projects);
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