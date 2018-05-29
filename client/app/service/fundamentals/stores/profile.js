import { LOAD } from "../mutationTypes";

const state = {
	profile: null
};

const getters = {
	profile(state) { return state.profile; }
};

const mutations = {
	[LOAD] (state, entity) {
		state.profile = entity;
	}
};

import profiles from "../repositories/rest/profiles";

export default {
	namespaced: true
	, state
	, getters
	, actions : {
		getProfile : profiles.get
	}
	, mutations
};