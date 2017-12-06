import { LOAD_PROJECTS,SELECT_PROJECT, DESELECT_PROJECT } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	projects: []
	, _projects: [] // 見本用
    , selectedProject: []
};

const mutations = {
	[LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state._projects.splice(0);
		state.projects.push(...models);
		state._projects.push(...models);
	}

	, [SELECT_PROJECT] (state, row) {
		state.projects.splice(0);
		state.projects.push(row);
		state.selectedProject.splice(0);
		state.selectedProject.push(row);
	}
	
	, [DESELECT_PROJECT] (state) {
		state.selectedProject.splice(0);
		state.projects.splice(0);
		state.projects.push(...state._projects);
	}
};

import * as getters from "./getters";
import * as actions from "./actions";

export default {
	namespaced : true
	, state
	, getters
	, actions
	, mutations
};