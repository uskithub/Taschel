import Project from "../entities/project";
import Task from "../entities/task";
import { UPDATE_TASK_OF_CURRENT_PROJECT } from "../mutationTypes";
import { assign } from "lodash";
import tasks from "../repositories/rest/tasks";
import domainGlue from "../domainGlue";

/**
 * This state is used in below:
 * 	- Gantt
 */
export default {
	state : {
		// DDD: Entities
	}
	, getters : {
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		// [INITIALIZE] (state) {
		// 	state.entities.splice(0);
		// }
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {

		// Usecase: 
		editTaskInProjectTree({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.put(rawValues)
			.then(data => {
				let task = new Task(data, projects);
				// mutation は session.js の mutations
				commit(UPDATE_TASK_OF_CURRENT_PROJECT, task);
			});
		}
	}
};