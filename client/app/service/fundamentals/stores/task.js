import Task from "../entities/task";
import { LOAD_TASKS, SELECT_TASK, CLEAR_SELECTION
	//, ARRANGE_AVOBE, ARRANGE_INTO, ARRANGE_BELOW 
} from "../mutationTypes";

const state = {
	// DDD: Entities
	entities: []
	, current: null
};

const getters = {
	tasks(state) { return state.entities; }
	, currentTask(state) { return state.current; }
};

const mutations = {
	[LOAD_TASKS] (state, rawValuesArr) {
		state.entities.splice(0);
		state.entities.push(...rawValuesArr.map(rawValues => {
			return new Task(rawValues);
		}));
	}
	, [SELECT_TASK] (state, entity) {
		state.current = entity;
	}
	, [CLEAR_SELECTION] (state) {
		state.current = null;
	}
	// , [ADD_TASK] (state, models) {
	// 	if (models.child) {
	// 		// the case models is { parent, child }
	// 		each(state.tasks, (item) => {
	// 			if (item.code == models.parent.code)
	// 				assign(item, models.parent);
	// 		});
	// 		state.tasks.unshift(models.child);
	// 	} else {
	// 		let isNotUpdate = !find(state.tasks, (item) => item.code == models.code);
	// 		if (isNotUpdate) {
	// 			state.tasks.unshift(models);
	// 		}
	// 	}
	// }
	// , [UPDATE] (state, model) {
	// 	if (model.status < 0) {
	// 		state.tasks = state.tasks.filter(t => { return t.code != model.code; });
	// 	} 
	// 	each(state.tasks, (item) => {
	// 		if (item.code == model.code)
	// 			assign(item, model);
	// 	});
	// }
	// , [REMOVE] (state, model) {
	// 	state.tasks = state.tasks.filter(item => item.code != model.code);
	// }
};

import tasks from "./actions/rest/tasks";

export default {
	namespaced: true
	, state
	, getters
	, actions : {
		getTaskList : tasks.get
	}
	, mutations
};