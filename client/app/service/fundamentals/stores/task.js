import { LOAD_TASKS, SELECT_TASK, CLEAR_SELECTION
	//, ARRANGE_AVOBE, ARRANGE_INTO, ARRANGE_BELOW 
} from "../mutationTypes";

const state = {
	tasks: []
	, currentTask: null
};

const getters = {
	tasks(state) { return state.tasks; }
	, currentTask(state) { return state.currentTask; }
};

const mutations = {
	[LOAD_TASKS] (state, models) {
		state.tasks.splice(0);
		state.tasks.push(...models);
	}
	, [SELECT_TASK] (state, row) {
		state.currentTask = row;
	}
	, [CLEAR_SELECTION] (state) {
		state.currentTask = null;
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

import { readTasks } from "./actions/rest/tasks";

export default {
	namespaced: true
	, state
	, getters
	, actions : {
		// DDD: Domain Service
		// Name actions in accordance with their use-cases.
		getTaskList : readTasks
	}
	, mutations
};