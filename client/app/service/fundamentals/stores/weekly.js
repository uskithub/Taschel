import Group from "../entities/group";
import { INITIALIZE, LOAD_WEEKLY_GROUPS } from "../mutationTypes";
import { assign } from "lodash";
import groups from "../repositories/rest/groups";
import domainGlue from "../domainGlue";

export default {
	state : {
		// DDD: Entities
		entities: []
	}
	, getters : {
		groups(state) { return state.entities; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[INITIALIZE] (state) {
			state.entities.splice(0);
		}
		, [LOAD_WEEKLY_GROUPS] (state, entities) {
			state.entities.splice(0);
			state.entities.push(...entities);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {

		// Usecase: a user watches tasks that the user do or did in a week.
		getMyWeeklyTasks : ({ commit, getters }) => {
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, week: currentWeek };
			return groups.get(options)
				.then(data => {
					let groups = data.map(rawValues => {
						return new Group(rawValues);
					});
					commit(LOAD_WEEKLY_GROUPS, groups);
				});
		}
		// Usecase: a user arrange a task from a group or another task to another group or task.
		, arrangeTasks : ({ commit, getters }, { task, from, to, index }) => {
			console.log(task, from, to, index);

			const groups = getters.groups;

			if (domainGlue.validateArrange(groups, task, from, to, index)) {
				// OK
			} else {
				// NG
				// TODO; 再描画
			}
		}
	}
};