import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/store";
import tasks from "../modules/tasks/store";
import common from "../modules/mytasks/store";
import devices from "../modules/devices/store";
import posts from "../modules/posts/store";
import counter from "../modules/counter/store";
import profile from "../modules/profile/store";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session
		, tasks
		, common
		, counter
		, devices
		, posts
		, profile
	}
});