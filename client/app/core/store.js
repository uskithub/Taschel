import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/store";
import gantPage from "../modules/gant/store";
import kanbanPage from "../modules/kanban/store";
import mytasksPage from "../modules/mytasks/store";
import projectsPage from "../modules/projects/store";
import tasksPage from "../modules/tasks/store";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session
		, gantPage
		, kanbanPage
		, mytasksPage
		, projectsPage
		, tasksPage
	}
});