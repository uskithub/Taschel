import Task from "../entities/task";
import { INITIALIZE, LOAD_TASKS, SELECT_TASK, CLEAR_SELECTION
	//, ARRANGE_AVOBE, ARRANGE_INTO, ARRANGE_BELOW 
} from "../mutationTypes";
import { assign } from "lodash";
import tasks from "../repositories/rest/tasks";

export default {
	state : {
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
		[INITIALIZE] (state) {
			state.entities.splice(0);
			state.current = null;
		}
		, [LOAD_TASKS] (state, entities) {
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
		getMyTaskList : ({ commit, getters }) => {
			// TODO: module分割して疎結合にすべきなのに、globalで見えるmeを（このmoduleは知らないのに）使っているのがキモチワルイ
			// 引数でComponent側から渡すべきか？
			// StoreはDDD的にはApplicationServiceに当たると思うので、ユースケースをactionで表現したい
			// userが誰か知らないのもおかしい気がする
			let user = getters.me;
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