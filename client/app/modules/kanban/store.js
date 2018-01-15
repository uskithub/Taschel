import { LOAD
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
	, tasks(state) { return state.tasks; }
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
	, [ADD] (state, model) {
		state.groups.push(model);
	}
	, [UPDATE] (state, model) {
		each(state.groups, (item) => {
			if (item.code == model.code)
				assign(item, model);
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

// import * as getters from "./getters";
import { createGroup, readGroups, updateGroups } from "../common/actions/groups";
import { arrangeTask2 } from "../common/actions/tasks";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createGroup, readGroups, updateGroups, arrangeTask2 }
	, mutations
};