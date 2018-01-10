import { 
	LOAD
	, ADD
	, SELECT
	, DESELECT
	, CLEAR_SELECT
	, UPDATE
	, REMOVE 
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	tasks: []
	, selected: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	tasks(state) { return state.tasks; }
	, selected(state) { return state.selected; }
};

// mutationにはstateを変更する処理を実装する。
// mutationは同期でなければならない。

const mutations = {
	// 定数を関数名として使用できる ES2015 の算出プロパティ名（computed property name）機能を使用することで
	// Lintできるようになったり、mutationの一覧性ができる
	[LOAD] (state, models) {
		state.tasks.splice(0);
		state.tasks.push(...models);
	}
	, [ADD] (state, models) {
		if (models.child) {
			// { parent, child }の形で来た場合
			each(state.tasks, (item) => {
				if (item.code == models.parent.code)
					assign(item, models.parent);
			});
			let isNotUpdate = !find(state.tasks, (item) => item.code == models.child.code);
			if (isNotUpdate) {
				state.tasks.push(models.child);
			}
		} else {
			let isNotUpdate = !find(state.tasks, (item) => item.code == models.code);
			if (isNotUpdate) {
				state.tasks.push(models);
			}
		}
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
	, [DESELECT] (state, row) {
		state.selected = state.selected.filter((item) => {
			return item != row;
		});
	}
	, [CLEAR_SELECT] (state) {
		state.selected.splice(0);
	}
	, [UPDATE] (state, model) {
		each(state.tasks, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.selected = state.selected.filter(item => item.code != model.code);
	}	
};

import { createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";
import { readUsers } from "../common/actions/persons";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask, readUsers }
	, mutations
};