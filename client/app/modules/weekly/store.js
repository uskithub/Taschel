import { 
	LOAD
	, ADD
	, UPDATE
	, REMOVE 
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	groups: []
	, tasks: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	groups(state) { return state.groups; }
	, tasks(state) { return state.tasks; }
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
		each(state.groups, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
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