"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Profile from "service/presentation/profile/presenter";
import MyTasks from "service/presentation/myTasks/presenter";
import Projects from "service/presentation/projects/presenter";
import WeeklyPlan from "service/presentation/weeklyPlan/presenter";
import DailyLoop from "service/presentation/dailyLoop/presenter";

import TimeLine from "service/presentation/timeline/presenter";
import Gantt from "service/presentation/gantt/presenter";

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
		, { path: "/weeklyPlan", name: WeeklyPlan.name, component: WeeklyPlan }
		, { path: "/gantt", component: Gantt }
		, { path: "/timeline", component: TimeLine }
	]
});