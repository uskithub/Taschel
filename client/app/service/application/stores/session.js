import { COMMON, SESSION } from "service/application/mutationTypes";

// Usecases
import {
	サービスの利用を開始する
	, プロフィールを取得する
	, 所属組織一覧を取得する
} from "service/application/usecases";

// Stores(Interactors)
import backlog from "./backlog";

// Repositories
import sessions from "service/infrastructure/repositories/rest/sessions";
import profiles from "service/infrastructure/repositories/rest/profiles";
import organizations from "service/infrastructure/repositories/rest/organizations";

// Entities
import User from "service/domain/entities/user";

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
	}
	, getters : {
		isReady(state) { return state.isReady; }
		, me(state) { return state.user; }
		, profile(state) { return state.profile; }
		, organizations(state) { return state.organizations; }
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
	}
};