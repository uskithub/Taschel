import { 
	LOAD
	, LOAD_WORKS
	, ADD_WORK
	, UPDATE
	, REMOVE
	, SELECT
	, CLEAR_SELECT 
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	assignedInWeeklyTasks: []
	, works: []
	, selected: []
};

// stateから値を取り出すのはgetterを使う
const getters = {
	assignedInWeeklyTasks(state) { return state.assignedInWeeklyTasks; }
	, works(state) { return state.works; }
	, selected(state) { return state.selected; }
};

// mutationにはstateを変更する処理を実装する。
// mutationは同期でなければならない。

const mutations = {
	// 定数を関数名として使用できる ES2015 の算出プロパティ名（computed property name）機能を使用することで
	// Lintできるようになったり、mutationの一覧性ができる
	[LOAD] (state, models) {
		state.assignedInWeeklyTasks.splice(0);
		if (models.length > 0) {
			state.assignedInWeeklyTasks.push(...models[0].children);
		}
	}
	, [LOAD_WORKS] (state, models) {
		state.works.splice(0);
		state.works.push(...models);
	}
	
	, [ADD_WORK] (state, model) {
		console.log("●きてうｒね", model);
		state.works.push(model);
	}
	, [UPDATE] (state, model) {
		each(state.works, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [SELECT] (state, model, multiSelect) {
		if (isArray(model)) {
			state.selected.splice(0);
			state.selected.push(...model);
		} else {
			if (multiSelect === true) {
				if (state.selected.indexOf(model) != -1)
					state.selected = state.selected.filter(item => item != model);
				else
					state.selected.push(model);

			} else {
				state.selected.splice(0);
				state.selected.push(model);
			}
		}
	}
	, [CLEAR_SELECT] (state) {
		state.selected.splice(0);
	}
};

// import { createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";

import { readGroups } from "../common/actions/groups";
import { createWork, readWorks, updateWork } from "../common/actions/works";

export default {
	namespaced : true
	, state
	, getters
	, actions : { readGroups, createWork, readWorks, updateWork }
	, mutations
};