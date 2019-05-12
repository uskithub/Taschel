import { PDCA } from "service/application/mutationTypes";

// Usecases
import {
	自分の週次タスクを取得する
	, その週に実施するタスクの貢献度と緊急度を決める
} from "service/application/usecases";

// Repositories
import groups from "service/infrastructure/repositories/rest/groups";
// Entities
import Group from "service/domain/entities/group";


// import Work from "../entities/work";
// import Review from "../entities/review";

// import { assign } from "lodash";
// import works from "../repositories/rest/works";
// import reviews from "../repositories/rest/reviews";
// import domainGlue from "../domainGlue";

// taskの再配置が業務ルール的にOKかどうか検査して返します
// ① from, to => UNCLASSIFIED|task, group	/api/groups/${to}?task=${moving}&index=${index}
//		-> [toDoc]
// ② from, to => group, UNCLASSIFIED|task	/api/groups/${from}?task=${moving}&index=${index}&remove=true
//		-> [fromDoc]
// ③ from, to => group, group				/api/groups/${to}?task=${moving}&index=${index}&from=${from}
//	  1. from, to => xxx, yyy
//		-> [toDoc, fromDoc];
//	  2. from, to => xxx, xxx
//		-> [fromDoc];
const validateArrange = (groups, task, from, to) => {
	// 0) from === to
	//	  OK
	// 1) group ---> group
	//	  OK
	// 2) group ---> task
	//	  OK, only the case that the task is the parent of "to".
	// 3) task ---> group
	//	  NG, the case that "to" is the same as the group on that the task's parent is.
	// 4) task ---> task
	//	  NG
	if (from.type === to.type && from.code === to.code) {
		// 0) from === to
		return true;
	}

	if (from.type === "group" && to.type === "group") {
		// 1) group ---> group
		return true;

	} else if (from.type === "group") {
		// 2) group ---> task
		return task.parent === to.code;
		
	} else if (from.type === "task" && to.type === "group") {
		// 3) task ---> group
		return !groups.filter(g => {
			if (g.code === to.code) {
				return g.tasks.filter(t => t.code === from.code).length > 0;
			}
			return false;
		}).length > 0;
		
	}
	// 4) task ---> task
	return false;
};

/**
 * This state is used in below:
 * 	- Weekly
 */
export default {
	state : {
		groups: []
		, currentweekTaskGroup: null
		, currentWeekWorks: []
		, currentWeekReviews: []
	}
	, getters : {
		groups(state) { return state.groups; }
		, currentweekTaskGroup(state) { return state.currentweekTaskGroup; }
		, currentWeekWorks(state) { return state.currentWeekWorks; }
		, currentWeekReviews(state) { return state.currentWeekReviews; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[PDCA.LOAD_WEEKLY_GROUPS] (state, entities) {
			state.groups.splice(0);
			state.groups.push(...entities);
		}
		// , [LOAD_CURRENTWEEK_TASK_GROUP] (state, entity) {
		// 	state.currentweekTaskGroup = entity;
		// }
		// , [LOAD_WEEKLY_WORKS] (state, entities) {
		// 	state.currentWeekWorks.splice(0);
		// 	state.currentWeekWorks.push(...entities);
		// }
		// , [LOAD_WEEKLY_REVIEWS] (state, entities) {
		// 	state.currentWeekReviews.splice(0);
		// 	state.currentWeekReviews.push(...entities);
		// }
		// , [ADD_WORK] (state, entity) {
		// 	let isFound = state.currentWeekWorks.find(e => e.code === entity.code);
		// 	if (!isFound) {
		// 		state.currentWeekWorks.push(entity);
		// 	}
		// }
		// , [REVIEW] (state, entity) {
		// 	let isFound = state.currentWeekReviews.find(e => e.code === entity.code);
		// 	if (!isFound) {
		// 		state.currentWeekReviews.push(entity);
		// 	}
		// }
		// , [UPDATE_WORK] (state, entity) {
		// 	state.currentWeekReviews.forEach(e => {
		// 		if (e.code === entity.code) {
		// 			assign(e, entity);
		// 		}
		// 	});
		// }
		// , [UPDATE_REVIEW] (state, entity) {
		// 	state.currentWeekWorks.forEach(e => {
		// 		if (e.code === entity.code) {
		// 			assign(e, entity);
		// 		}
		// 	});
		// }
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {

		// Usecase: a user watches tasks that the user do or did in the current week.
		[自分の週次タスクを取得する]({ commit, getters }) {
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, week: currentWeek };
			const projects = getters.projects;
			return groups.get(options)
				.then(data => {
					let groups = data.map(rawValues => {
						return new Group(rawValues, projects);
					});
					commit(PDCA.LOAD_WEEKLY_GROUPS, groups);
				});
		}
		// Usecase: a user arrange a task from a group or another task to another group or task.
		, [その週に実施するタスクの貢献度と緊急度を決める]({ commit, getters }, { task, from, to, index }) {
			console.log(task, from, to, index);
			const _groups = getters.groups;
			const projects = getters.projects;

			if (validateArrange(_groups, task, from, to)) {
				// OK
				console.log("validate OK");

				return Promise.resolve()
					.then(() => {
						// Removing
						// you must execute removing before adding because of the index problem.
						if (from.type === "group" && from.entity.code !== "UNCLASSIFIED" && from.entity.code !== to.entity.code) {
							// removing from "from"  if "from" is not "UNCLASSIFIED".
							let rawValues = from.entity.rawValues;
							let newChildren = rawValues.children.map(child => { return child.code; })
								.filter(code => { return code !== task.code; });

							return groups.patch({ code: rawValues.code, children: newChildren });
						}
						return null;
					})
					.then(data => {
						// Adding
						if (to.type === "group" && to.entity.code !== "UNCLASSIFIED") {
							// adding to "to" if "to" is not "UNCLASSIFIED".
							let rawValues = to.entity.rawValues;
							let newChildren = rawValues.children.map(child => { return child.code; })
								.filter(code => { return code !== task.code; });
							newChildren.splice(index, 0, task.code);

							return groups.patch({ code: rawValues.code, children: newChildren });
						}
						return data;
					})
					.then(_ => {
						// Refresh
						const user = getters.me;
						const currentWeek = getters.currentWeek;
						const options = { user: user.code, week: currentWeek };
						return groups.get(options)
							.then(data => {
								let groups = data.map(rawValues => {
									return new Group(rawValues, projects);
								});
								commit(PDCA.LOAD_WEEKLY_GROUPS, groups);
							});
					});

			} else {
				// NG
				// TODO: 再描画
				console.log("validae NG");
			}
		}
		// Usecase: a user watches tasks that the user decided to do in the current week.
		// , getCurrentWeekTasks({ commit, getters }) {
		// 	// TODO: getMyWeeklyTasks同様に week で取得して、クライアント側でガッチャンコすれば、サーバ側のロジックを統一できる
		// 	const user = getters.me;
		// 	const currentWeek = getters.currentWeek;
		// 	const options = { user: user.code, day: currentWeek };
		// 	return groups.get(options)
		// 		.then(data => {
		// 			if (data.length > 0) {
		// 				commit(LOAD_CURRENTWEEK_TASK_GROUP, new Group(data[0]));
		// 			} else {
		// 				commit(LOAD_CURRENTWEEK_TASK_GROUP, null);
		// 			}
		// 		});
		// }
		// // Usecase: a user watches works that the user scheduled to do in the current week.
		// , getCurrentWeekWorks({ commit, getters }) {
		// 	const user = getters.me;
		// 	const currentWeek = getters.currentWeek;
		// 	const options = { user: user.code, week: currentWeek };
		// 	return works.get(options)
		// 		.then(data => {
		// 			let works = data.map(rawValues => {
		// 				return new Work(rawValues);
		// 			});
		// 			commit(LOAD_WEEKLY_WORKS, works);
		// 		});
		// }
		// // Usecase:
		// , getCurrentWeekReviews({ commit, getters }) {
		// 	const user = getters.me;
		// 	const currentWeek = getters.currentWeek;
		// 	const options = { user: user.code, week: currentWeek };
		// 	return reviews.get(options)
		// 		.then(data => {
		// 			let reviews = data.map(rawValues => {
		// 				return new Review(rawValues);
		// 			});
		// 			commit(LOAD_WEEKLY_REVIEWS, reviews);
		// 		});
		// }
		// // Usecase: a user add new work.
		// , addWork({ commit }, rawValues) {
		// 	return works.post(rawValues)
		// 		.then(data => {
		// 			let work = new Work(data);
		// 			commit(ADD_WORK, work);
		// 		});
		// }
		// // Usecase: a user edit a work. 
		// , editWork({ commit }, rawValues) {
		// 	return works.put(rawValues)
		// 		.then(data => {
		// 			let work = new Work(data);
		// 			commit(UPDATE_WORK, work);
		// 		});
		// }
		// // Usecase: a user close a work. 
		// , closeWork({ commit }, rawValues) {
		// 	rawValues.status = -1;
		// 	return works.put(rawValues)
		// 		.then(data => {
		// 			let work = new Work(data);
		// 			commit(UPDATE_WORK, work);
		// 			return work;
		// 		});
		// }
		// // Usecase: a user review a day.
		// , review({ commit }, rawValues) {
		// 	return reviews.post(rawValues)
		// 		.then(data => {
		// 			let review = new Review(data);
		// 			commit(REVIEW, review);
		// 		});
		// }
		// // Usecase: a user edit a review.
		// , editReview({ commit }, rawValues) {
		// 	return reviews.put(rawValues)
		// 		.then(data => {
		// 			let review = new Review(data);
		// 			commit(UPDATE_REVIEW, review);
		// 		});
		// }
	}
};