import Project from "../entities/project";
import Task from "../entities/task";
import { INITIALIZE, LOAD_TASKS } from "../mutationTypes";
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
		project: null
	}
	, getters : {
		currentProjectTask(state) { return state.entities; }
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

		// Usecase: 
		getCurrentProjectTaskList({ commit, getters }) {
			const options = { task : getters.currentProject.code };
			return tasks.get(options)
				.then(data => {
					commit(LOAD_TASKS, new Project(data));
				});
		}
	}
};