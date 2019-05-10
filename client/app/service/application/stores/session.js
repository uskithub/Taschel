import { COMMON, SESSION } from "service/application/mutationTypes";

// Usecases
import {
	サービスの利用を開始する
	, プロフィールを取得する
	, 所属組織一覧を取得する
	, 自分のタスク一覧を取得する
} from "service/application/usecases";

// Stores(Interactors)
import backlog from "./backlog";

// Repositories
import sessions from "service/infrastructure/repositories/rest/sessions";
import profiles from "service/infrastructure/repositories/rest/profiles";
import organizations from "service/infrastructure/repositories/rest/organizations";
import tasks from "service/infrastructure/repositories/rest/tasks";

// Entities
import User from "service/domain/entities/user";
import Task from "service/domain/entities/task";

// DDD: Application Service
export default {
	modules: {
		backlog
	}
	, state : {
		isReady: false
		, user: null
		, currentUser: null
		, profile: null
		, organizations: []
		, tasks: []
		, editingTaskTree: null
	}
	, getters : {
		isReady(state) { return state.isReady; }
		, me(state) { return state.user; }
		, profile(state) { return state.profile; }
		, organizations(state) { return state.organizations; }
		, tasks (state) { return state.tasks; }
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
		, [SESSION.SET_USER_TASKS] (state, entities) {
			state.tasks.splice(0);
			state.tasks.push(...entities);
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
		, [自分のタスク一覧を取得する] ({ commit, getters }) {
			// TODO: module分割して疎結合にすべきなのに、globalで見えるmeを（このmoduleは知らないのに）使っているのがキモチワルイ
			// 引数でComponent側から渡すべきか？
			// StoreはDDD的にはApplicationServiceに当たると思うので、ユースケースをactionで表現したい
			// userが誰か知らないのもおかしい気がする
			const user = getters.me;
			const options = { user: user.code };
			const projects = getters.projects;
			return tasks.get(options)
				.then(data => {
					const tasks = data.map(rawValues => {
						return new Task(rawValues, projects);
					});
					commit(SESSION.SET_USER_TASKS, tasks);
				})
				.then(_ => {
					console.log("interacted ->", 自分のタスク一覧を取得する);
				});
		}
	}
};