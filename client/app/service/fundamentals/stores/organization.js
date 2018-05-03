import { LOAD_ORGANIZATIONS } from "../mutationTypes";

const state = {
	entities: []
	, current: null
};

const getters = {
	organizations(state) { return state.entities; }
};

const mutations = {
	[LOAD_ORGANIZATIONS] (state, entities) {
		state.entities.splice(0);
		state.entities.push(...entities);
	}
};

import { readOrganizations } from "./actions/rest/organizations";

export default {
	namespaced: true
	, state
	, getters
	, actions : {
		// DDD: Domain Service
		// Name actions in accordance with their use-cases.
		getOrganizationList : readOrganizations
	}
	, mutations
};