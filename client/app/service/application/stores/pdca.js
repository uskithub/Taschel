import { PDCA } from "../mutationTypes";

// Usecases
import {
	操作対象の週を変更する
	, 自分の週次タスクを取得する
	, その週に実施するタスクの貢献度と緊急度を決める
	, 自分のその週のタスク一覧を取得する
	, 自分のその週のワーク一覧を取得する
	, 自分のその週のレビュー一覧を取得する
	, 自分のその週の週次レビューを取得する
	, ワークを追加する
	, ワークを編集する
	, ワークをクローズする
	, ワークを削除する
	, 日次レビューする
	, レビューを編集する
	, レビュー対象を選択する
} from "../usecases";

// Repositories
import groups from "../../infrastructure/repositories/rest/groups";
import works from "../../infrastructure/repositories/rest/works";
import reviews from "../../infrastructure/repositories/rest/reviews";
import weeklyReviews from "../../infrastructure/repositories/rest/weeklyReviews";

// Entities
import Group from "../../domain/entities/group";
import Work from "../../domain/entities/work";
import Review from "../../domain/entities/review";
import WeeklyReview from "../../domain/entities/weeklyReview";
import ReviewItem from "../../domain/entities/reviewItem";
import TaskLayer from "../../domain/entities/taskLayer";
import ReviewLayer from "../../domain/entities/reviewLayer";
import ReviewItemLayer from "../../domain/entities/reviewItemLayer";
import Board from "../../domain/entities/genericBoard";


import moment from "moment";

import { assign } from "lodash";

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
 * 	- WeeklyLoop
 *  - DailyLoop
 */
export default {
	state : {
		groups: []
		, currentWeek: (() => { return moment().day(1); })()
		, currentweekTaskGroup: null
		, currentWeekWorks: []
		, currentWeekReviews: []
		, currentWeekSelectedReviews: null
	}
	, getters : {
		currentWeekPlanningBoards(state) { 
			let layers = state.groups.map( g => new TaskLayer(g, g.code != "UNCLASSIFIED"));
			const first = layers.shift();
			let boards = new Array();
			boards.push(new Board("unclassified", [first]));
			boards.push(new Board("classified", layers));
			return boards;
		}
		, currentWeek(state) { return state.currentWeek.format("YYYY-MM-DD"); }
		, currentWeekOfMonth(state) { 
			const todayWeek = state.currentWeek.week();
			const firstDay = moment(state.currentWeek).startOf("month");
			const firstDayWeek = firstDay.week();
			const weekOfMonth = ((todayWeek > firstDayWeek) ? todayWeek - firstDayWeek : todayWeek - firstDayWeek + 52) + 1;
			return `${ firstDay.format("YYYY年MM月") } 第${weekOfMonth}週`; 
		}
		, currentweekTasks(state) { 
			if (state.currentweekTaskGroup) {
				return state.currentweekTaskGroup.tasks; 
			} else {
				return [];
			}
		}
		, currentweekTaskLayer(state) {
			if (state.currentweekTaskGroup) {
				return new TaskLayer(state.currentweekTaskGroup, false);
			} else {
				return new TaskLayer({ code : "weekly", name : "Tasks", tasks : [] }, false);
			}
		}
		, currentWeekWorks(state) { return state.currentWeekWorks; }
		, currentWeekReviews(state) { return state.currentWeekReviews; }
		, currentWeekReviewLayer(state) {
			return new ReviewLayer({ 
				code : "weekly"
				, name : "Tasks"
				, reviews : state.currentWeekReviews 
			}
			, false);
		}
		, currentWeekReviewBoard(state) {
			const reviewLayer = new ReviewLayer( 
				"daily-reviews"
				, "Daily Reviews"
				, state.currentWeekReviews 
				, false);
			const selectedReviewLayer = new ReviewItemLayer( 
				"weekly-reviews"
				, "Weekly Reviews"
				, (state.currentWeekSelectedReviews) ? state.currentWeekSelectedReviews.items : []
				, false);
			return new Board("unclassified", [reviewLayer, selectedReviewLayer]);
		}
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[PDCA.LOAD_WEEKLY_GROUPS] (state, entities) {
			state.groups.splice(0);
			state.groups.push(...entities);
		}
		, [PDCA.SET_CURRENT_WEEK] (state, entity) {
			state.currentWeek = entity;
		}
		, [PDCA.LOAD_CURRENTWEEK_TASK_GROUP] (state, entity) {
			state.currentweekTaskGroup = entity;
		}
		, [PDCA.LOAD_WEEKLY_WORKS] (state, entities) {
			state.currentWeekWorks.splice(0);
			state.currentWeekWorks.push(...entities);
		}
		, [PDCA.LOAD_WEEKLY_REVIEWS] (state, entities) {
			state.currentWeekReviews.splice(0);
			state.currentWeekReviews.push(...entities);
		}
		, [PDCA.LOAD_WEEKLY_SELECTED_REVIEWS] (state, entity) {
			state.currentWeekSelectedReviews = entity;
		}
		, [PDCA.ADD_WORK] (state, entity) {
			let isFound = state.currentWeekWorks.find(work => work.code === entity.code);
			if (!isFound) {
				state.currentWeekWorks.push(entity);
			}
		}
		, [PDCA.UPDATE_WORK] (state, entity) {
			state.currentWeekWorks.forEach(work => {
				if (work.code === entity.code) {
					assign(work, entity);
				}
			});
		}
		, [PDCA.REVIEW] (state, entity) {
			let isFound = state.currentWeekReviews.find(rview => rview.code === entity.code);
			if (!isFound) {
				state.currentWeekReviews.push(entity);
			}
		}
		, [PDCA.UPDATE_REVIEW] (state, entity) {
			state.currentWeekReviews.forEach(rview => {
				if (rview.code === entity.code) {
					assign(rview, entity);
				}
			});
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		[操作対象の週を変更する]({ commit }, momentObj) {
			const m = momentObj.day(1);
			return Promise.resolve()
				.then(() => {
					commit(PDCA.SET_CURRENT_WEEK, m);
				});
		}
		// Usecase: a user watches tasks that the user do or did in the current week.
		, [自分の週次タスクを取得する]({ commit, getters }) {
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
		, [自分のその週のタスク一覧を取得する]({ commit, getters }) {
			// TODO: getMyWeeklyTasks同様に week で取得して、クライアント側でガッチャンコすれば、サーバ側のロジックを統一できる
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, day: currentWeek };
			return groups.get(options)
				.then(data => {
					if (data.length > 0) {
						commit(PDCA.LOAD_CURRENTWEEK_TASK_GROUP, new Group(data[0]));
					} else {
						commit(PDCA.LOAD_CURRENTWEEK_TASK_GROUP, null);
					}
				});
		}
		// Usecase: a user watches works that the user scheduled to do in the current week.
		, [自分のその週のワーク一覧を取得する]({ commit, getters }) {
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, week: currentWeek };
			return works.get(options)
				.then(data => {
					let works = data.map(rawValues => {
						return new Work(rawValues);
					});
					commit(PDCA.LOAD_WEEKLY_WORKS, works);
				});
		}
		// Usecase:
		, [自分のその週のレビュー一覧を取得する]({ commit, getters }) {
			const user = getters.me;
			const currentWeek = getters.currentWeek;
			const options = { user: user.code, week: currentWeek };
			return reviews.get(options)
				.then(data => {
					let reviews = data.map(rawValues => {
						return new Review(rawValues);
					});
					commit(PDCA.LOAD_WEEKLY_REVIEWS, reviews);
				});
		}
		, [自分のその週の週次レビューを取得する]({ commit, getters }) {
			const currentWeek = getters.currentWeek;
			const options = { week: currentWeek };
			return weeklyReviews.get(options)
				.then(data => {
					commit(PDCA.LOAD_WEEKLY_SELECTED_REVIEWS, new WeeklyReview(data));
				});
		}
		// Usecase: a user add new work.
		, [ワークを追加する]({ commit }, rawValues) {
			return works.post(rawValues)
				.then(data => {
					let work = new Work(data);
					commit(PDCA.ADD_WORK, work);
				});
		}
		// Usecase: a user edit a work. 
		, [ワークを編集する]({ commit }, rawValues) {
			return works.put(rawValues)
				.then(data => {
					let work = new Work(data);
					commit(PDCA.UPDATE_WORK, work);
				});
		}
		// Usecase: a user close a work. 
		, [ワークをクローズする]({ commit }, rawValues) {
			rawValues.status = -1;
			return works.put(rawValues)
				.then(data => {
					let work = new Work(data);
					commit(PDCA.UPDATE_WORK, work);
					return work;
				});
		}
		, [ワークを削除する]({ commit }, rawValues) {
			return works.delete(rawValues)
				.then(data => {
					// do nothing
				});
		}
		// Usecase: a user review a day.
		, [日次レビューする]({ commit }, rawValues) {
			return reviews.post(rawValues)
				.then(data => {
					let review = new Review(data);
					commit(PDCA.REVIEW, review);
				});
		}
		// Usecase: a user edit a review.
		, [レビューを編集する]({ commit }, rawValues) {
			return reviews.put(rawValues)
				.then(data => {
					let review = new Review(data);
					commit(PDCA.UPDATE_REVIEW, review);
				});
		}
		, [レビュー対象を選択する]({ commit, getters, state }, { type, item, index }) {
			const currentWeek = getters.currentWeek;
			if (state.currentWeekSelectedReviews === null) {
				const rawValues = {
					week: currentWeek
					, type: type
					, item: item.code
				};
				return weeklyReviews.post(rawValues)
					.then(data => {
						commit(PDCA.LOAD_WEEKLY_SELECTED_REVIEWS, new WeeklyReview(data));
					});
			} else {
				const rawValues = {
					code: state.currentWeekSelectedReviews.code
					, week: currentWeek
					, type: type
					, item: item.code
				};
				return weeklyReviews.put(rawValues)
					.then(data => {
						commit(PDCA.LOAD_WEEKLY_SELECTED_REVIEWS, new WeeklyReview(data));
					});
			}
		}
	}
};