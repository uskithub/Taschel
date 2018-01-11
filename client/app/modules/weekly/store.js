import { 
	LOAD
	, ADD
	, UPDATE
	, REMOVE 
	, SELECT
	, CLEAR_SELECT
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	groups: []
	// in the future, maybe selectedGroup will be required. so this is named selected"Tasks"
	, selectedTasks: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	groups(state) { return state.groups; }
	, selectedTasks(state) { return state.selectedTasks; }
};

// mutationにはstateを変更する処理を実装する。
// mutationは同期でなければならない。

const mutations = {
	// 定数を関数名として使用できる ES2015 の算出プロパティ名（computed property name）機能を使用することで
	// Lintできるようになったり、mutationの一覧性ができる
	[LOAD] (state, models) {
		state.groups.splice(0);
		state.groups.push(...models);
	}
	, [ADD] (state, models) {
		if (models.child) {
			// { parent, child }の形で来た場合
			// parentはrootのprojectなので無視
			let isNotUpdate = !find(state.groups[0].children, (item) => item.code == models.child.code);
			if (isNotUpdate) {
				state.groups[0].children.push(models.child);
			}
		} else {
			let isNotUpdate = !find(state.groups[0].children, (item) => item.code == models.code);
			if (isNotUpdate) {
				state.groups[0].children.unshift(models);
			}
		}	
	}
	, [UPDATE] (state, model) {
		state.groups.forEach(g => {
			g.children.forEach(task => {
				if (task.code == model.code) {
					assign(task, model);
				}
			});
		});
	}
	, [SELECT] (state, model, multiSelect) {
		if (isArray(model)) {
			state.selectedTasks.splice(0);
			state.selectedTasks.push(...model);
		} else {
			if (multiSelect === true) {
				if (state.selectedTasks.indexOf(model) != -1)
					state.selectedTasks = state.selectedTasks.filter(item => item != model);
				else
					state.selectedTasks.push(model);

			} else {
				state.selectedTasks.splice(0);
				state.selectedTasks.push(model);
			}
		}
	}
	, [CLEAR_SELECT] (state) {
		state.selectedTasks.splice(0);
	}
};

import { createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";
import { createGroup, readGroups, updateGroups } from "../common/actions/groups";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createGroup, readGroups, updateGroups, createTask, readTasks, updateTask, deleteTask }
	, mutations
};