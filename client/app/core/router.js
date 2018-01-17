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
import Debug from "../modules/debug";

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
		, { path: "/debug", component: Debug }
		
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
	]
});