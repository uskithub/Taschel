"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Profile from "service/presentation/profile/presenter";
import MyTasks from "service/presentation/myTasks/presenter";
import Projects from "service/presentation/projects/presenter";
import WeeklyLoop from "service/presentation/weeklyLoop/presenter";
import DailyLoop from "service/presentation/dailyLoop/presenter";

import TimeLine from "service/presentation/timeline/presenter";
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
		, { path: "/weeklyLoop", name: WeeklyLoop.name, component: WeeklyLoop }
		, { path: "/gantt", component: Gantt }
		, { path: "/timeline", component: TimeLine }
	]
});