import { COMMON, SESSION } from "service/application/mutationTypes";

// Usecases
import {
	サービスの利用を開始する
	, プロフィールを取得する
	, 所属組織一覧を取得する
	, 組織を作成する
	, 自分のプロジェクト一覧を取得する
	, プロジェクトを選択する
	, 新しいプロジェクトを追加する
	, プロジェクトを更新する
	, プロジェクトをクローズする
} from "service/application/usecases";

// Stores(Interactors)
import backlog from "./backlog";
import pdca from "./pdca";
import feedback from "./feedback";
import planning from "./planning";

// Repositories
import sessions from "service/infrastructure/repositories/rest/sessions";
import profiles from "service/infrastructure/repositories/rest/profiles";
import organizations from "service/infrastructure/repositories/rest/organizations";
import tasks from "service/infrastructure/repositories/rest/tasks";

// Entities
import User from "service/domain/entities/user";
import Project from "service/domain/entities/project";
import TaskTreenode from "service/domain/entities/tasktreenode";

import { assign } from "lodash";

// DDD: Application Service
export default {
	modules: {
		backlog
		, pdca
		, feedback
		, planning
	}
	, state : {
		isReady: false
		, user: null
		, currentUser: null
		, profile: null
		, organizations: []
		
		, projects: []
		, currentProjectRef: null // current project entity
	}
	, getters : {
		isReady(state) { return state.isReady; }
		, me(state) { return state.user; }
		, profile(state) { return state.profile; }
		, organizations(state) { return state.organizations; }
		, projects(state) { return state.projects; }
		, currentProject(state) { return state.currentProjectRef; }
		, currentProjectTaskSubTrees(state) {
			if (state.currentProjectRef !== null) {
				return state.currentProjectRef.tasks.map(t => {
					return new TaskTreenode(t);
				});
			} else {
				return [];
			}
		}
	}
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations :  {
		[COMMON.GET_READY] (state) {
			state.isReady = true;
		}
		, [SESSION.SET_USER] (state, user) {
			state.user = user;
			if (state.currentUser === null) {
				state.currentUser = state.user.code;
			}
		}
		, [SESSION.SET_USER_PROFILE] (state, data) {
			state.profile = data;
		}
		, [SESSION.SET_USER_ORGNIZATIONS] (state, data) {
			state.organizations = data;
		}
		, [SESSION.LOAD_PROJECTS] (state, entities) {
			state.projects.splice(0);
			state.projects.push(...entities);
		}
		, [SESSION.SET_CURRENT_PROJECT] (state, entity) {
			state.currentProjectRef = entity;
		}
		, [SESSION.ADD_PROJECT] (state, entity) {
			let isFound = state.projects.find(project => project.code === entity.code);
			if (!isFound) {
				state.projects.push(entity);
			}
		}
		, [SESSION.UPDATE_PROJECT] (state, entity) {
			state.projects.forEach(project => {
				if (project.code === entity.code) {
					assign(project, entity);
				}
			});
		}
		, [SESSION.CLOSE_PROJECT] (state, code) {
			state.projects = state.projects.filter(project => project.code != code);
		}
		, [SESSION.ADD_TASK_TO_PROJECT] (state, task) {
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
		, [SESSION.UPDATE_TASK_OF_CURRENT_PROJECT] (state, entity) {
			state.currentProjectRef.updateDescendant(entity);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		[サービスの利用を開始する]({ commit }) {
			return sessions.get()
				.then(data => {
					let user = new User(data);
					commit(SESSION.SET_USER, user);
				})
				.then(_ => {
					console.log("interacted ->", サービスの利用を開始する);
				});
		}
		, [プロフィールを取得する]({ commit, getters }) {
			const user = getters.me;
			return profiles.get(user.code)
				.then(data => {
					// TODO: entityに詰める
					// let user = new User(data);
					commit(SESSION.SET_USER_PROFILE, data);
				})
				.then(_ => {
					console.log("interacted ->", プロフィールを取得する);
				});
		}
		, [所属組織一覧を取得する]({ commit, getters }) {
			const user = getters.me;
			return organizations.get(user.code)
				.then(data => {
					// TODO: entityに詰める
					// let user = new User(data);
					commit(SESSION.SET_USER_ORGNIZATIONS, data);
				})
				.then(_ => {
					console.log("interacted ->", 所属組織一覧を取得する);
				});
		}
		, [自分のプロジェクト一覧を取得する]({ commit, getters }, { options } = {}) {
			const savedCurrentProject = getters.currentProject ? getters.currentProject.code : null;

			const user = getters.me;
			options = assign({ taskType : "project", user : user.code }, options);

			return tasks.get(options)
				.then(data => {
					let projects = data.map(rawValues => {
						return new Project(rawValues);
					});
					commit(SESSION.LOAD_PROJECTS, projects);
				})
				.then(() => {
					// select current project
					if (savedCurrentProject === null) {
						for (let i=0, len = getters.projects.length; i<len; i++) {
							let p = getters.projects[i];
							if (p.author.code === user.code) {
								commit(SESSION.SET_CURRENT_PROJECT, p);
								return;
							}
						}
						commit(SESSION.SET_CURRENT_PROJECT, getters.projects[0]);
					} else {
						for (let i=0, len = getters.projects.length; i<len; i++) {
							let p = getters.projects[i];
							if (p.code === savedCurrentProject) {
								commit(SESSION.SET_CURRENT_PROJECT, p);
								return;
							}
						}
					}
				});
		}
		, [プロジェクトを選択する]({ commit }, project) {
			commit(SESSION.SET_CURRENT_PROJECT, project);
		}
		, [新しいプロジェクトを追加する]({ commit, getters }, rawValues) {
			let user = getters.me;
			rawValues = assign({ type: "project", author : user.code }, rawValues);
			return tasks.post(rawValues)
				.then(data => {
					let project = new Project(data);
					commit(SESSION.ADD_PROJECT, project);
				});
		}
		// Usecase: a user completes editing a project.
		, [プロジェクトを更新する]({ commit }, rawValues) {
			return tasks.put(rawValues)
				.then(data => {
					let project = new Project(data);
					commit(SESSION.UPDATE_PROJECT, project);
				});
		}
		, [プロジェクトをクローズする]({ commit }, rawValues) {
			rawValues.status = -1;
			return tasks.put(rawValues)
				.then(data => {
					commit(SESSION.CLOSE_PROJECT, data.code);
				});
		}
	}
};