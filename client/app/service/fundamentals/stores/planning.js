
import Task from "../entities/task";
import { INITIALIZE, LOAD_TASKS } from "../mutationTypes";
import { assign } from "lodash";
import tasks from "../repositories/rest/tasks";
import domainGlue from "../domainGlue";

export default {
	state : {
		// DDD: Entities
		entities: []
	}
	, getters : {
		tasks(state) { return state.entities; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[INITIALIZE] (state) {
			state.entities.splice(0);
		}
		, [LOAD_TASKS] (state, entities) {
			state.entities.splice(0);
			state.entities.push(...entities);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {

		// Usecase: a user watches tasks that the user do or did in the current week.
		getCurrentProjectTaskList({ commit, getters }) {
			const user = getters.me;
			const options = { user : user.code };
			const projects = getters.projects;
			return tasks.get(options)
				.then(data => {
					let tasks = data.map(rawValues => {
						return new Task(rawValues, projects);
					});
					commit(LOAD_TASKS, tasks);
				});
		}
	}
};