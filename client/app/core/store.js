import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/store";
import milestones from "../modules/milestones/store";
import tasks from "../modules/mytasks/store";
import devices from "../modules/devices/store";
import posts from "../modules/posts/store";
import counter from "../modules/counter/store";
import profile from "../modules/profile/store";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session
		, milestones
		, tasks
		, counter
		, devices
		, posts
		, profile
	}
});