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

import Settings from "../modules/settings";
import Debug from "../modules/debug";

import Profile from "../service/standards/profile/index";
import MyTasks2 from "../service/standards/myTasks/index";
import Projects2 from "../service/standards/projects/index";
import Weekly2 from "../service/standards/weekly/index";

import DailyLoop from "../service/plugins/dailyLoop/interface/index";
import TimeLine from "../service/standards/timeline/index";
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
		
		, { path: "/settings", component: Settings }
		, { path: "/debug", component: Debug }
		
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
		, { path: "/profile", component: Profile }
		
		, { path: "/v2/", name: MyTasks2.name, component: MyTasks2 }
		, { path: "/v2/dailyLoop", component: DailyLoop }
		, { path: "/v2/projects", name: Projects2.name, component: Projects2 }
		, { path: "/v2/weekly", name: Weekly2.name, component: Weekly2 }
		, { path: "/v2/gantt", component: Gantt2 }
		, { path: "/v2/timeline", component: TimeLine }
	]
});