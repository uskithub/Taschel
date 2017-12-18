import { LOAD_PROJECTS, LOAD_USERS, SET_CURRENT_PROJECT } from "./constants/mutationTypes";

const state = {
	projects: []
	, users: []
	, currentProject: null  // task.code 
};

const getters = {
	projects(state) { return state.projects; }
	, users(state) { return state.users; }
	, currentProject(state) { return state.currentProject; }
};

const mutations = {
	[LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state.projects.push(...models);
	}
	, [LOAD_USERS] (state, models) {
		state.users.splice(0);
		state.users.push(...models);
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