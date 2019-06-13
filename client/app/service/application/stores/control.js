import { CONTROL } from "../mutationTypes";

// Usecases
import {
	プロジェクトのカンバンを取得する
} from "../usecases";

// Repositories
import groups from "../../infrastructure/repositories/rest/groups";

// Entities
import Group from "../../domain/entities/group";
import TaskLayer from "../../domain/entities/taskLayer";
import Board from "../../domain/entities/genericBoard";

/**
 * This state is used in below:
 * 	- Timeline
 */
export default {
	state : {
		// DDD: Entities
		groups: []
	}
	, getters : {
		currentProjectKanbanBoard(state) { 
			let layers = state.groups.map( g => new TaskLayer(g, g.code != "UNCLASSIFIED"));
			return new Board("kanban", layers);
		}
	}
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[CONTROL.LOAD_KANBAN] (state, entities) {
			state.groups.splice(0);
			state.groups.push(...entities);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: 
		[プロジェクトのカンバンを取得する]({ commit, getters }) {
			const currentProject = getters.currentProject;
			const projects = getters.projects;
			const options = { parent: currentProject.code };
			return groups.get(options)
				.then(data => {
					let groups = data.map(rawValues => {
						return new Group(rawValues, projects);
					});
					commit(CONTROL.LOAD_KANBAN, groups);
				});
		}
	}
};