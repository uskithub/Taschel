import { LOAD_PROJECTS, SELECT_PROJECT, DESELECT_PROJECT } from "../../common/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	projects: []
	, _projects: [] // 見本用
    , selectedProject: []
};

const getters = {
	projects(state) { return state.projects; }
	, selectedProject(state) { return state.selectedProject; }
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

import { createTask, readTasks, updateTask, deleteTask, arrangeTask } from "../common/tasks/actions";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask, arrangeTask }
	, mutations
};