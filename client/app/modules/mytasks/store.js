import { LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE } from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	tasks: []
	, selected: []
};

const getters = {
	tasks(state) { return state.tasks; }
	, selected(state) { return state.selected; }
};

const mutations = {
	[LOAD] (state, models) {
		state.tasks.splice(0);
		state.tasks.push(...models);
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
		let isNotUpdate = !find(state.tasks, (item) => item.code == model.code);
		if (isNotUpdate)
			state.tasks.push(model);
	}
	, [UPDATE] (state, model) {
		each(state.tasks, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.tasks = state.tasks.filter(item => item.code != model.code);
	}
};

import { checkTask, createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";

export default {
	namespaced : true
	, state
	, getters
	, actions : { checkTask, createTask, readTasks, updateTask, deleteTask }
	, mutations
};