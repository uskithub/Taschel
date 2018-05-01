import Vue from "vue";
import Vuex from "vuex";

import session from "../service/fundamentals/stores/session";
import profile from "../service/fundamentals/stores/profile";
import task from "../service/fundamentals/stores/task";
import shared from "../modules/common/store";

import ganttPage from "../modules/gantt/store";
import kanbanPage from "../modules/kanban/store";
import mytasksPage from "../modules/mytasks/store";
import projectsPage from "../modules/projects/store";
import tasksPage from "../modules/tasks/store";
import weeklyPage from "../modules/weekly/store";
import dailyPage from "../modules/daily/store";
import dailyReviewPage from "../modules/daily-review/store";
import debugPage from "../modules/debug/store";


Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session
		, profile
		, task
		, shared
		, ganttPage
		, kanbanPage
		, mytasksPage
		, projectsPage
		, tasksPage
		, weeklyPage
		, dailyPage
		, dailyReviewPage
		, debugPage
	}
});