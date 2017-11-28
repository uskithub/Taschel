import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	rows_project: []
	, rows_milestone: []
    , selected_project: []
	, selected_milestone: []
};

const mutations = {
	[LOAD] (state, models) {
		state.rows_project.splice(0);
		state.rows_project.push(...models);
	}
	, [ADD] (state, model) {
		let found = find(state.rows_project, (item) => item.code == model.code);
		if (!found)
			state.rows_project.push(model);
	}
	, [SELECT] (state, row, multiSelect) {
		if (isArray(row)) {
			state.selected_project.splice(0);
			state.selected_project.push(...row);
		} else {
			if (multiSelect === true) {
				if (state.selected_project.indexOf(row) != -1)
					state.selected_project = state.selected_project.filter(item => item != row);
				else
					state.selected_project.push(row);

			} else {
				state.selected_project.splice(0);
				state.selected_project.push(row);
			}
		}
	}
	, [CLEAR_SELECT] (state) {
		state.selected_project.splice(0);
	}
	, [UPDATE] (state, model) {
		each(state.rows_project, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.rows_project = state.rows_project.filter(item => item.code != model.code);
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