import { LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE } from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	projects: []
	, selected: []
};

const getters = {
	projects(state) { return state.projects; }
	, selected(state) { return state.selected; }
};

// stateを操作するためのメソッド
const mutations = {
	[LOAD] (state, models) {
		state.projects.splice(0);
		state.projects.push(...models);
	}
	, [SELECT] (state, row, multiSelect) {
		if (isArray(row)) {
			state.selected.splice(0);
			state.selected.push(...row);
		} else {
			if (multiSelect === true) {
				if (state.selected.indexOf(row) != -1)
					state.selected = state.selected.filter(item => item != row);
				else
					state.selected.push(row);

			} else {
				state.selected.splice(0);
				state.selected.push(row);
			}
		}
	}
	, [CLEAR_SELECT] (state) {
		state.selected.splice(0);
	}
	, [ADD] (state, model) {
		let found = find(state.projects, (item) => item.code == model.code);
		if (!found)
			state.projects.push(model);
	}
	, [UPDATE] (state, model) {
		each(state.projects, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.projects = state.projects.filter(item => item.code != model.code);
	}
};

import { createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask }
	, mutations
};