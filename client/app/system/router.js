"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Weekly from "../modules/weekly";
import Daily from "../modules/daily";
import DailyReview from "../modules/daily-review";
import Projects from "../modules/projects"; 
import Tasks from "../modules/tasks";
import Kanban from "../modules/kanban"; 
import MyTasks from "../modules/mytasks";
import Gantt from "../modules/gantt";
import Profile from "../modules/profile";
import Settings from "../modules/settings";
import Debug from "../modules/debug";

import DailyLoop from "../service/plugins/dailyLoop/interface/index";
import Gantt2 from "../service/plugins/gantt/interface/index";
import Kanban2 from "../service/plugins/kanban/interface/index";

Vue.use(VueRouter);

export default new VueRouter({
	mode: "hash",
	routes: [
		{ path: "/", component: MyTasks }
		, { path: "/weekly", component: Weekly }
		, { path: "/daily", component: Daily }
		, { path: "/daily-review", component: DailyReview }
		, { path: "/projects", component: Projects }
		, { path: "/tasks", component: Tasks }
		, { path: "/kanban", component: Kanban }
		, { path: "/gantt", component: Gantt }
		, { path: "/profile", component: Profile }
		, { path: "/settings", component: Settings }
		, { path: "/debug", component: Debug }
		
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
		
		, { path: "/v2/myTasks", component: DailyLoop }
		, { path: "/v2/dailyLoop", component: DailyLoop }
		, { path: "/v2/gantt", component: Gantt2 }
		, { path: "/v2/kanban", component: Kanban2 }
	]
});