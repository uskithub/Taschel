import { BACKLOG } from "service/application/mutationTypes";

// Usecases
import {
	タスクをルートとしたタスクツリーを取得する
} from "service/application/usecases";

// Repositories
import tasks from "service/infrastructure/repositories/rest/tasks";

// Entities
import Task from "service/domain/entities/task";
import Treenode from "service/domain/entities/treenode";

import { assign } from "lodash";

/**
 * This state is used in below:
 * 	- MyTasks
 */
export default {
	state: {
		tasks: []
		, editingTaskTree: null
	}
	, getters: {
		tasks (state) { return state.entities; }
		, taskTree (state) { return state.taskTree; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations: {
		// [INITIALIZE] (state) {
		// 	state.entities.splice(0);
		// 	state.current = null;
		// }
		// , [LOAD_TASKS] (state, entities) {
		// 	state.entities.splice(0);
		// 	state.entities.push(...entities);
		// }
		// , [ADD_TASK] (state, entity) {
		// 	const isFound = state.entities.find(e => e.code === entity.code);
		// 	if (!isFound) {
		// 		state.entities.push(entity);
		// 	}
		// }
		// , [UPDATE_TASK] (state, entity) {
		// 	state.entities.forEach(e => {
		// 		if (e.code === entity.code) {
		// 			assign(e, entity);
		// 		}
		// 	});
		// }
		// , [CLOSE_TASK] (state, code) {
		// 	state.entities = state.entities.filter(p => p.code !== code);
		// }
		[BACKLOG.SET_TASK_TREE] (state, entity) {
			state.taskTree = entity;
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions: {
		// Usecase:
		// , addTask ({ commit, getters }, rawValues) {
		// 	const projects = getters.projects;
		// 	return tasks.post(rawValues)
		// 		.then(data => {
		// 			const task = new Task(data, projects);
		// 			// TODO: 既存のtasksのどこに突っ込むか（ソート、フィルタとか）
		// 			commit(ADD_TASK, task);
		// 		});
		// }
		// // Usecase:
		// , editTask ({ commit, getters }, rawValues) {
		// 	const projects = getters.projects;
		// 	return tasks.put(rawValues)
		// 		.then(data => {
		// 			const task = new Task(data, projects);
		// 			commit(UPDATE_TASK, task);
		// 		});
		// }
		// // Usecase:
		// , closeTask ({ commit, getters }, rawValues) {
		// 	const projects = getters.projects;
		// 	rawValues.status = -1;
		// 	return tasks.put(rawValues)
		// 		.then(data => {
		// 			const task = new Task(data, projects);
		// 			commit(CLOSE_TASK, task.code);
		// 		});
		// }
		// Usecase: get an editing task's parent as detail if it has.
		[タスクをルートとしたタスクツリーを取得する] ({ commit, getters }, task) {
			const projects = getters.projects;
			if (task.parent !== -1) {
				return tasks.get({ code: task.parent })
					.then(data => {
						commit(BACKLOG.SET_TASK_TREE, new Treenode(new Task(data, projects)));
					})
					.then(_ => {
						console.log("interacted ->", タスクをルートとしたタスクツリーを取得する);
					});
                    
			} else {
				commit(BACKLOG.SET_TASK_TREE, new Treenode(task));
				console.log("interacted ->", タスクをルートとしたタスクツリーを取得する);
			}
		}
	}
};
