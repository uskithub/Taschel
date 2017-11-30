import { LOAD_PROJECTS, LOAD_TASKS, ADD, SELECT_TASKS, SELECT_PROJECT, DESELECT_PROJECT, DESELECT_TASK, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	projects: []
	, tasks: []
    , selectedProject: []
	, selectedTasks: []
};

const mutations = {
	[LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state.projects.push(...models);
	}
	, [LOAD_TASKS] (state, models) {
		state.tasks.splice(0);
		state.tasks.push(...models);
	}
	, [ADD] (state, model) {
		let found = find(state.selectedTasks, (item) => item.code == model.code);
		if (!found)
			state.tasks.push(model);
	}
	, [SELECT_PROJECT] (state, row) {
		state.selectedProject.splice(0);
		state.selectedProject.push(row);
	}
	, [SELECT_TASKS] (state, row, multiSelect) {
		if (isArray(row)) {
			state.selectedTasks.splice(0);
			state.selectedTasks.push(...row);
		} else {
			if (multiSelect === true) {
				if (state.selectedTasks.indexOf(row) != -1)
					state.selectedTasks = state.selectedTasks.filter(item => item != row);
				else
					state.selectedTasks.push(row);

			} else {
				state.selectedTasks.splice(0);
				state.selectedTasks.push(row);
			}
		}
	}
	, [DESELECT_PROJECT] (state) {
		state.selectedProject.splice(0);
	}
	, [DESELECT_TASK] (state, row) {
		state.selectedTasks = state.selectedTasks.filter((item) => {
			return item != row;
		});
	}
	, [CLEAR_SELECT] (state) {
		state.selectedTasks.splice(0);
	}
	, [UPDATE] (state, model) {
		each(state.selectedTasks, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.selectedTasks = state.selectedTasks.filter(item => item.code != model.code);
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