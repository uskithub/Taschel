import { LOAD_PROJECTS } from "../../common/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	projects: []
	, _projects: [] // 見本用
};

const getters = {
	projects(state) { return state.projects; }
};

const mutations = {
	[LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state._projects.splice(0);
		state.projects.push(...models);
		state._projects.push(...models);
	}
};

import { createTask, readTasks, updateTask, deleteTask, arrangeTask } from "../common/tasks/actions";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask, arrangeTask }
	, mutations
};