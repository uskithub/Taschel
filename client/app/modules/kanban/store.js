import { LOAD
	, LOAD_USERS
	, ADD
	, UPDATE
	, REMOVE 
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	groups: []
	, tasks: []
	, users: []
	, selectedTasks: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	groups(state) { return state.groups; }
	, tasks(state) { return state.tasks; }
	, users(state) { return state.users; }
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
	, [LOAD_USERS] (state, models) {
		state.users.splice(0);
		state.users.push(...models);
	}
	, [ADD] (state, model) {
		state.groups.push(model);
	}
	, [UPDATE] (state, model) {
		each(state.groups, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.selectedTasks = state.selectedTasks.filter(item => item.code != model.code);
	}	
};

// import * as getters from "./getters";
import { createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";
import { createGroup, readGroups, updateGroups } from "../common/actions/groups";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createGroup, readGroups, updateGroups, createTask, readTasks, updateTask, deleteTask }
	, mutations
};