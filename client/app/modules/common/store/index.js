import { SET_CURRENT_PROJECT } from "../../../common/mutationTypes";

const state = {
    // task.code 
	currentProject: null
};

const getters = {
	currentProject(state) { return state.currentProject; }
};

const mutations = {
	[SET_CURRENT_PROJECT] (state, code) {
		state.currentProject = code;
	}
};

export default {
	namespaced : true
	, state
	, getters
	, mutations
};