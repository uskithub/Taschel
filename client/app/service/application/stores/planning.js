import { SESSION } from "service/application/mutationTypes";

// Usecases
import {
	プロジェクトにタスクを追加する
	, プロジェクトのタスクを編集する
	, 自分のプロジェクト一覧を取得する
	, タスクを別のタスクの子タスクにする
} from "service/application/usecases";

// Repositories
import tasks from "service/infrastructure/repositories/rest/tasks";

// Entities
import Task from "service/domain/entities/task";

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
		// currentProjectRef が session.stateにあるので
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: 
		[プロジェクトにタスクを追加する]({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.post(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					// mutation は session.js の mutations
					commit(SESSION.ADD_TASK_TO_PROJECT, task);
				});
		}
		// Usecase: 
		, [プロジェクトのタスクを編集する]({ commit, getters }, rawValues) {
			const projects = getters.projects;
			return tasks.put(rawValues)
				.then(data => {
					let task = new Task(data, projects);
					// mutation は session.js の mutations
					commit(SESSION.UPDATE_TASK_OF_CURRENT_PROJECT, task);
				});
		}
		, [タスクを別のタスクの子タスクにする]({ dispatch, commit, getters }, { task, from, to, index }) {
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