"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Profile from "../service/presentation/profile/presenter";
import MyTasks from "../service/standards/myTasks/index";
import Projects from "../service/standards/projects/index";
import Weekly from "../service/standards/weekly/index";

import DailyLoop from "../service/plugins/dailyLoop/interface/index";
import TimeLine from "../service/standards/timeline/index";
import Gantt from "../service/plugins/gantt/interface/index";

Vue.use(VueRouter);

export default new VueRouter({
	mode: "hash"
	, routes: [
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
		{ path: "/profile", component: Profile }
		
		, { path: "/", name: MyTasks.name, component: MyTasks }
		, { path: "/dailyLoop", component: DailyLoop }
		, { path: "/projects", name: Projects.name, component: Projects }
		, { path: "/weekly", name: Weekly.name, component: Weekly }
		, { path: "/gantt", component: Gantt }
		, { path: "/timeline", component: TimeLine }
	]
});