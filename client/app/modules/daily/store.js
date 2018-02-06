import { 
	LOAD
	, LOAD_WORKS
	, ADD
	, UPDATE
	, REMOVE
	, SELECT
	, CLEAR_SELECT 
	, SELECT_DAY_OF_WEEK
	, LOAD_REVIEWS
	, ADD_REVIEW
} from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	assignedInWeeklyTasks: []
	, works: []
	, reviews: []
	, selected: []
	, reviewingDayOfWeek: null
};

// stateから値を取り出すのはgetterを使う
const getters = {
	assignedInWeeklyTasks(state) { return state.assignedInWeeklyTasks; }
	, works(state) { return state.works; }
	, reviews(state) { return state.reviews; }
	, selected(state) { return state.selected; }
	, reviewingDayOfWeek(state) { return state.reviewingDayOfWeek; }
};

// mutationにはstateを変更する処理を実装する。
// mutationは同期でなければならない。

const mutations = {
	// 定数を関数名として使用できる ES2015 の算出プロパティ名（computed property name）機能を使用することで
	// Lintできるようになったり、mutationの一覧性ができる
	[LOAD] (state, models) {
		state.assignedInWeeklyTasks.splice(0);
		if (models.length > 0) {
			state.assignedInWeeklyTasks.push(...models[0].children);
		}
	}
	, [LOAD_WORKS] (state, models) {
		state.works.splice(0);
		state.works.push(...models);
	}
	
	, [ADD] (state, model) {
		state.works.push(model);
	}
	, [UPDATE] (state, model) {
		each(state.works, (item) => {
			if (item.code == model.code)
				assign(item, model);
		});
	}
	, [REMOVE] (state, model) {
		state.works = state.works.filter(w => { return w.code != model.code; });
	}
	, [SELECT] (state, model, multiSelect) {
		if (isArray(model)) {
			state.selected.splice(0);
			state.selected.push(...model);
		} else {
			if (multiSelect === true) {
				if (state.selected.indexOf(model) != -1)
					state.selected = state.selected.filter(item => item != model);
				else
					state.selected.push(model);

			} else {
				state.selected.splice(0);
				state.selected.push(model);
			}
		}
	}
	, [CLEAR_SELECT] (state) {
		state.selected.splice(0);
	}
	, [SELECT_DAY_OF_WEEK] (state, dayOfWeek) {
		state.reviewingDayOfWeek = dayOfWeek;
	}
	, [LOAD_REVIEWS] (state, models) {
		state.reviews.splice(0);
		state.reviews.push(...models);
	}
	, [ADD_REVIEW] (state, model) {
		state.reviews.push(model);
	}
};

// import { createTask, readTasks, updateTask, deleteTask } from "../common/actions/tasks";

import { readGroups } from "../common/actions/groups";
import { createWork, readWorks, updateWork, deleteWork } from "../common/actions/works";
import { createReview, readReviews, updateReview } from "../common/actions/reviews";
import { readUsers } from "../common/actions/persons";

export default {
	namespaced : true
	, state
	, getters
	, actions : { readGroups, createWork, readWorks, updateWork, deleteWork, createReview, readReviews, updateReview, readUsers }
	, mutations
};