import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/store";

import devices from "../modules/devices/store";
import posts from "../modules/posts/store";
import counter from "../modules/counter/store";
import profile from "../modules/profile/store";

import gantPage from "../modules/gant/store";
import kanbanPage from "../modules/kanban/store";
import mytasksPage from "../modules/mytasks/store";
import projectsPage from "../modules/projects/store";
import tasksPage from "../modules/tasks/store";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session
		, counter
		, devices
		, posts
		, profile

		, gantPage
		, kanbanPage
		, mytasksPage
		, projectsPage
		, tasksPage
	}
});