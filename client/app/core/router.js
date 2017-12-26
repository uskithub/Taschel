"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Weekly from "../modules/weekly";
import Daily from "../modules/daily";
import Projects from "../modules/projects"; 
import Tasks from "../modules/tasks";
import Kanban from "../modules/kanban"; 
import MyTasks from "../modules/mytasks";
import Gant from "../modules/gant";
import Profile from "../modules/profile";
import Debug from "../modules/debug";

Vue.use(VueRouter);

export default new VueRouter({
	mode: "hash",
	routes: [
		{ path: "/", component: MyTasks }
		, { path: "/weekly", component: Weekly }
		, { path: "/daily", component: Daily }
		, { path: "/projects", component: Projects }
		, { path: "/tasks", component: Tasks }
		, { path: "/kanban", component: Kanban }
		, { path: "/gant", component: Gant }
		, { path: "/profile", component: Profile }
		, { path: "/debug", component: Debug }
		
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
	]
});