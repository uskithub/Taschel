import Task from "../entities/task";
import { LOAD_TASKS, SELECT_TASK, CLEAR_SELECTION
	//, ARRANGE_AVOBE, ARRANGE_INTO, ARRANGE_BELOW 
} from "../mutationTypes";
import { assign } from "lodash";
import tasks from "../repositories/rest/tasks";

export default {
	namespaced: true
	, state : {
		// DDD: Entities
		entities: []
		, current: null
	}
	, getters : {
		tasks(state) { return state.entities; }
		, currentTask(state) { return state.current; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[LOAD_TASKS] (state, entities) {
			state.entities.splice(0);
			state.entities.push(...entities);
		}
		, [SELECT_TASK] (state, entity) {
			state.current = entity;
		}
		, [CLEAR_SELECTION] (state) {
			state.current = null;
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: a user watches a list of tasks.
		getMyTaskList : ({ dispatch, commit, getters, rootGetters }) => {
			let user = rootGetters["session/me"];
			let options = { user : user.code };
			return tasks.get(options)
				.then(data => {
					let tasks = data.map(rawValues => {
						return new Task(rawValues);
					});
					commit(LOAD_TASKS, tasks);
				});
		}
	}
};