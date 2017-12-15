import { LOAD_PROJECTS
	, LOAD
	, LOAD_USERS
	, ADD
	, SELECT
	, DESELECT
	, CLEAR_SELECT
	, UPDATE
	, REMOVE 
} from "../../common/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	projects: []
	, _projects: [] // 見本用
	, tasks: []
	, users: []
	, selectedTasks: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	projects(state) { return state.projects; }
	, tasks(state) { return state.tasks; }
	, users(state) { return state.users; }
	, selectedTasks(state) { return state.selectedTasks; }
};

// mutationにはstateを変更する処理を実装する。
// mutationは同期でなければならない。

const mutations = {
	// 定数を関数名として使用できる ES2015 の算出プロパティ名（computed property name）機能を使用することで
	// Lintできるようになったり、mutationの一覧性ができる
	[LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state._projects.splice(0);
		state.projects.push(...models);
		state._projects.push(...models);
	}
	, [LOAD] (state, models) {
		state.tasks.splice(0);
		state.tasks.push(...models);
	}
	, [LOAD_USERS] (state, models) {
		state.users.splice(0);
		state.users.push(...models);
	}
	, [ADD] (state, models) {
		// models : { parent, cihld }
		let isNotUpdate = !find(state.selectedTasks, (item) => item.code == models.child.code);
		if (isNotUpdate) {
			state.tasks.push(models.child);
		}
	}
	, [SELECT] (state, row, multiSelect) {
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
	, [DESELECT] (state, row) {
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

import { createTask, readTasks, updateTask, deleteTask } from "../common/tasks/actions";
import { readUsers } from "../common/persons/actions";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask, readUsers }
	, mutations
};