import { METHOD, api } from "../../../system/fundamentals/api";
const NAMESPACE = "/api/profile";

const state = {
	profile: {}
};

const getters = {
	profile(state) { return state.profile; }
};

const actions = {
	getProfile({ commit }, { options }) {
		let url = `${NAMESPACE}/${options.userCode}`;
		return api(METHOD.get, url)
			.then(data => {
				commit("UPDATE", data);
			});
	}
};

const mutations = {
	["UPDATE"] (state, profile) {
		state.profile = profile;
	}
};

export default {
	namespaced: true
	, state
	, getters
	, actions
	, mutations
};