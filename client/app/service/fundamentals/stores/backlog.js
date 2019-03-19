import Task from "../entities/task";
import { INITIALIZE, LOAD_TASKS, ADD_TASK, UPDATE_TASK, LOAD_EDITING_TASK_TREE
	//, ARRANGE_AVOBE, ARRANGE_INTO, ARRANGE_BELOW 
} from "../mutationTypes";
import { assign } from "lodash";
import tasks from "../repositories/rest/tasks";

/**
 * This state is used in below:
 * 	- MyTasks
 */
export default {
	state : {
		// DDD: Entities
		entities: []
		, editingTaskTree: null
	}
	, getters : {
		tasks(state) { return state.entities; }
		, currentEditingTaskTree(state) { return state.editingTaskTree; }
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
		, [ADD_TASK] (state, entity) {
			let isFound = state.entities.find(e => e.code === entity.code);
			if (!isFound) {
				state.entities.push(entity);
			}
		}
		, [UPDATE_TASK] (state, entity) {
			state.entities.forEach(e => {
				if (e.code === entity.code) {
					assign(e, entity);
				}
			});
		}
		, [LOAD_EDITING_TASK_TREE] (state, entity) {
			state.editingTaskTree = entity;
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: a user watches a list of tasks.
		getMyTaskList({ commit, getters }) {
			// TODO: module分割して疎結合にすべきなのに、globalで見えるmeを（このmoduleは知らないのに）使っているのがキモチワルイ
			// 引数でComponent側から渡すべきか？
			// StoreはDDD的にはApplicationServiceに当たると思うので、ユースケースをactionで表現したい
			// userが誰か知らないのもおかしい気がする
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
		// Usecase:
		, addTask({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.post(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					// TODO: 既存のtasksのどこに突っ込むか（ソート、フィルタとか）
					commit(ADD_TASK, task);
				});
		}
		// Usecase:
		, editTask({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.put(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					commit(UPDATE_TASK, task);
				});
		}
		// Usecase:
		, closeTask({ commit, getters }, rawValues) {
			const projects = getters.projects;
			rawValues.status = -1;
			return tasks.put(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					commit(CLOSE_TASK, task);
				});
		}
		// Usecase: get an editing task's parent as detail if it has.
		, getTaskDetail({ commit, getters }, task) {
			const projects = getters.projects;
			if (task.parent !== -1 ) {
				return tasks.get({ code: task.parent })
					.then(data => {
						commit(LOAD_EDITING_TASK_TREE, new Task(data, projects));
					});
			} else {
				commit(LOAD_EDITING_TASK_TREE, task);
			}
		}
	}
};