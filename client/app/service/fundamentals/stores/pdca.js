import Group from "../entities/group";
import Work from "../entities/work";
import { INITIALIZE, LOAD_WEEKLY_GROUPS, LOAD_CURRENTWEEK_TASK_GROUP, LOAD_WEEKLY_WORKS, ADD_WORK, UPDATE_WORK } from "../mutationTypes";
import { assign } from "lodash";
import groups from "../repositories/rest/groups";
import works from "../repositories/rest/works";
import domainGlue from "../domainGlue";

export default {
	state : {
		// DDD: Entities
		entities: []
		, currentweekTaskGroup: null
		, currentWeekWorks: []
	}
	, getters : {
		groups(state) { return state.entities; }
		, currentweekTaskGroup(state) { return state.currentweekTaskGroup; }
		, currentWeekWorks(state) { return state.currentWeekWorks; }
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
		, [LOAD_CURRENTWEEK_TASK_GROUP] (state, entity) {
			state.currentweekTaskGroup = entity;
		}
		, [LOAD_WEEKLY_WORKS] (state, entities) {
			state.currentWeekWorks.splice(0);
			state.currentWeekWorks.push(...entities);
		}
		, [ADD_WORK] (state, entity) {
			let isFound = state.currentWeekWorks.find(w => w.code === entity.code);
			if (!isFound) {
				state.currentWeekWorks.push(entity);
			}
		}
		, [UPDATE_WORK] (state, entity) {
			state.currentWeekWorks.forEach(w => {
				if (w.code === entity.code) {
					assign(w, entity);
				}
			});
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {

		// Usecase: a user watches tasks that the user do or did in the current week.
		getMyWeeklyTasks: ({ commit, getters }) => {
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
		, arrangeTasks: ({ commit, getters }, { task, from, to, index }) => {
			console.log(task, from, to, index);
			const _groups = getters.groups;

			if (domainGlue.validateArrange(_groups, task, from, to, index)) {
				// OK
				console.log("validae OK");

				return Promise.resolve()
					.then(() => {
						// you must execute removing before adding because of the index problem.
						if (from.type === "group" && from.code !== "UNCLASSIFIED") {
							// removing from "from"  if "from" is not "UNCLASSIFIED".
							return groups.put(from.code, task.code, false);
						}
						return null;
					})
					.then(data => {
						if (to.type === "group" && to.code !== "UNCLASSIFIED") {
							// adding to "to" if "to" is not "UNCLASSIFIED".
							return groups.put(to.code, task.code, true, index);
						}
						return data;
					})
					.then(data => {
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
					});

			} else {
				// NG
				// TODO: 再描画
				console.log("validae NG");
			}
		}
		// Usecase: a user watches tasks that the user decided to do in the current week.
		, getCurrentWeekTasks: ({ commit, getters }) => {
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, day: currentWeek };
			return groups.get(options)
				.then(data => {
					if (data.length > 0) {
						commit(LOAD_CURRENTWEEK_TASK_GROUP, new Group(data[0]));
					} else {
						commit(LOAD_CURRENTWEEK_TASK_GROUP, null);
					}
				});
		}
		// Usecase: a user watches works that the user scheduled to do in the current week.
		, getCurrentWeekWorks: ({ commit, getters }) => {
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, week: currentWeek };
			return works.get(options)
				.then(data => {
					let works = data.map(rawValues => {
						return new Work(rawValues);
					});
					commit(LOAD_WEEKLY_WORKS, works);
				});
		}
		// Usecase: a user add new work.
		, addWork: ({ commit }, rawValues) => {
			return works.post(rawValues)
				.then(data => {
					let work = new Work(data);
					commit(ADD_WORK, work);
				});
		}
		// Usecase:
		, editWork: ({ commit }, rawValues) => {
			return works.put(rawValues)
				.then(data => {
					let work = new Work(data);
					commit(UPDATE_WORK, work);
				});
		} 
	}
};