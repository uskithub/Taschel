import { LOAD, ADD, SET_CURRENT, CLEAR_SELECTION } from "../mutationTypes";

const state = {
	entities: []
	, current: null
};

const getters = {
	organizations(state) { return state.entities; }
	, current(state) { return state.current; }
};

const mutations = {
	[LOAD] (state, entities) {
		state.entities.splice(0);
		state.entities.push(...entities);
	}
	, [ADD] (state, entity) {
		let isNotUpdate = !find(state.entities, (item) => item.code == entity.code);
		if (isNotUpdate) {
			state.entities.unshift(entity);
		}
	}
	, [SET_CURRENT] (state, entity) {
		state.current = entity;
	}
	, [CLEAR_SELECTION] (state) {
		state.current = null;
	}
};

import organizations from "./actions/rest/organizations";

export default {
	namespaced: true
	, state
	, getters
	, actions : {
		// DDD: Domain Service
		// Name actions in accordance with their use-cases.
		getOrganizationList : organizations.get
		, createOrganization : organizations.post
	}
	, mutations
};