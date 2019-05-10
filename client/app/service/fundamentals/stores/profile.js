import { INITIALIZE, LOAD } from "../mutationTypes";

const state = {
	profile: null
};

const getters = {
	profile (state) { return state.profile; }
};

const mutations = {
	[INITIALIZE] (state) {
		console.log("ほら呼ばれた");
		state.profile = null;
	}
	, [LOAD] (state, entity) {
		state.profile = entity;
	}
};

import profiles from "../repositories/rest/profiles";

export default {
	state
	, getters
	, actions: {
		getProfile: profiles.get
	}
	, mutations
};
