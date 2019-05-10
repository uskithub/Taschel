import { COMMON, SESSION } from "../mutationTypes";
import {
	サービスの利用を開始する
	, プロフィールを取得する
	, 所属組織一覧を取得する
} from "../usecases";
import User from "../../domain/entities/user";
import sessions from "../../infrastructure/repositories/rest/sessions";
import profiles from "../../infrastructure/repositories/rest/profiles";
import organizations from "../../infrastructure/repositories/rest/organizations";

// DDD: Application Service
export default {
	modules: { 
		
	}
	, state : {
		isReady: false
		, user: null
		, currentUser: null
		, profile: null
		, organizations: null
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
		// getStartUsing({ commit }) {
			return sessions.get()
				.then(data => {
					let user = new User(data);
					commit(SESSION.SET_USER, user);
				});
		}
		, [プロフィールを取得する]({ commit, getters }) {
			const user = getters.me;
			return profiles.get(user.code)
				.then(data => {
					// TODO: entityに詰める
					// let user = new User(data);
					commit(SESSION.SET_USER_PROFILE, data);
					return data;
				});
		}
		, [所属組織一覧を取得する]({ commit, getters }) {
			const user = getters.me;
			return organizations.get(user.code)
				.then(data => {
					// TODO: entityに詰める
					// let user = new User(data);
					commit(SESSION.SET_USER_ORGNIZATIONS, data);
				});
		}
	}
};