import { BACKLOG } from "service/application/mutationTypes";

// Usecases
import {
	自分のタスク一覧を取得する
	, タスクをルートとしたタスクツリーを取得する
	, タスクを更新する
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
		, taskTree: null
	}
	, getters: {
		tasks (state) { return state.tasks; }
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
		
		// , [CLOSE_TASK] (state, code) {
		// 	state.entities = state.entities.filter(p => p.code !== code);
		// }
		[BACKLOG.SET_USER_TASKS] (state, entities) {
			state.tasks.splice(0);
			state.tasks.push(...entities);
		}
		, [BACKLOG.SET_TASK_TREE] (state, entity) {
			state.taskTree = entity;
		}
		, [BACKLOG.UPDATE_TASK] (state, entity) {
			state.tasks.forEach(task => {
				if (task.code === entity.code) {
					assign(task, entity);
				}
			});
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
        
		[自分のタスク一覧を取得する] ({ commit, getters }) {
			// TODO: module分割して疎結合にすべきなのに、globalで見えるmeを（このmoduleは知らないのに）使っているのがキモチワルイ
			// 引数でComponent側から渡すべきか？
			// StoreはDDD的にはApplicationServiceに当たると思うので、ユースケースをactionで表現したい
			// userが誰か知らないのもおかしい気がする
			const user = getters.me;
			const options = { user: user.code };
			const projects = getters.projects;
			return tasks.get(options)
				.then(data => {
					const tasks = data.map(rawValues => {
						return new Task(rawValues, projects);
					});
					commit(BACKLOG.SET_USER_TASKS, tasks);
				})
				.then(_ => {
					console.log("interacted ->", 自分のタスク一覧を取得する);
				});
		}
		, [タスクをルートとしたタスクツリーを取得する] ({ commit, getters }, task) {
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
		, [タスクを更新する] ({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.put(rawValues)
				.then(data => {
					const task = new Task(data, projects);
					commit(BACKLOG.UPDATE_TASK, task);
				});
		}
	}
};
