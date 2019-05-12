import { PLANNING } from "service/application/mutationTypes";

// Usecases
import {
	プロジェクトのルート直下のタスクを追加する
	, プロジェクトのルート直下のタスクを編集する
	, 自分のプロジェクト一覧を取得する
} from "service/application/usecases";

// Repositories
import tasks from "service/infrastructure/repositories/rest/tasks";

// Entities
import Task from "service/domain/entities/task";

import { assign } from "lodash";

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
		[PLANNING.ADD_TASK_TO_PROJECT] (state, task) {
			const findParentRecursivelyToAddChild = (targetTask, newTask) => {
				if (targetTask.code === newTask.parent) {
					targetTask.addChild(newTask);
					return true;
				} else {
					let tasks = targetTask.tasks;
					for (let i=0, len=tasks.length; i<len; i++) {
						if (findParentRecursivelyToAddChild(tasks[i], newTask)) {
							return true;
						}
					}
					return false;
				}
			};
			findParentRecursivelyToAddChild(state.currentProjectRef, task);
		}
		, [PLANNING.UPDATE_TASK_OF_CURRENT_PROJECT] (state, entity) {
			state.currentProjectRef.updateDescendant(entity);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: 
		[プロジェクトのルート直下のタスクを追加する]({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.post(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					// mutation は session.js の mutations
					commit(PLANNING.ADD_TASK_TO_PROJECT, task);
				});
		}
		// Usecase: 
		, [プロジェクトのルート直下のタスクを編集する]({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.put(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					// mutation は session.js の mutations
					commit(PLANNING.UPDATE_TASK_OF_CURRENT_PROJECT, task);
				});
		}
		
		, addTaskToProject({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.post(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					// TODO: 既存のtasksのどこに突っ込むか（ソート、フィルタとか）
					commit(PLANNING.ADD_TASK_TO_PROJECT, task);
				});
		}
		, arrangeTasksInAnotherTask({ dispatch, commit, getters }, { task, from, to, index }) {
			console.log(task, from, to, index);

			return Promise.resolve()
				.then(() => {
					// Removing
					// you must execute removing before adding because of the index problem.
					if (from.code !== to.code) {
						let rawValues = from.entity.rawValues;
						let newChildren = rawValues.children.map(child => { return child.code; })
							.filter(code => { return code !== task.code; });

						return tasks.patch({ code: rawValues.code, children: newChildren });
					}
					return null;
				})
				.then(data => {
					// Adding
					// adding to "to" if "to" is not "UNCLASSIFIED".
					let rawValues = to.entity.rawValues;
					let newChildren = rawValues.children.map(child => { return child.code; })
						.filter(code => { return code !== task.code; });
					newChildren.splice(index, 0, task.code);

					return tasks.patch({ code: rawValues.code, children: newChildren });
				})
				.then(data => {
					// modify parent
					return tasks.patch({ code: task.code, parent: to.code });
				})
				.then(data => {
					// refresh
					return dispatch(自分のプロジェクト一覧を取得する);
				});
		}
	}
};