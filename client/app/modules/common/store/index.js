import { LOAD_PROJECTS, SET_CURRENT_PROJECT } from "../../../common/mutationTypes";

const state = {
    projects: []
	, currentProject: null  // task.code 
};

const getters = {
    projects(state) { return state.projects; }
	, currentProject(state) { return state.currentProject; }
};

const mutations = {
    [LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state.projects.push(...models);
	}
	, [SET_CURRENT_PROJECT] (state, code) {
		state.currentProject = code;
	}
};

export default {
	namespaced : true
	, state
    , getters
    // sharedにはactionを持たせないこと
    //, actions
	, mutations
};