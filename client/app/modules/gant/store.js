import { LOAD_PROJECTS } from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

// TODO: GantだけProject読み込み時にPopulateさせているのでSharedと分けるかもしれないので残している
const state = {
// 	projects: []
};

const getters = {
// 	projects(state) { return state.projects; }
};

const mutations = {
	// [LOAD_PROJECTS] (state, models) {
	// 	state.projects.splice(0);
	// 	state.projects.push(...models);
	// }
};

import { createTask, readTasks, updateTask, deleteTask, arrangeTask } from "../common/actions/tasks";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask, arrangeTask }
	, mutations
};