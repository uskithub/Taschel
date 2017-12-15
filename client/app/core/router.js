"use strict";

import Vue from "vue";
import VueRouter from "vue-router";


import Projects from "../modules/projects"; 
import Tasks from "../modules/tasks";
import Kanban from "../modules/kanban"; 
import MyTasks from "../modules/mytasks";
import Gant from "../modules/gant";
import Profile from "../modules/profile";

Vue.use(VueRouter);

export default new VueRouter({
	mode: "hash",
	routes: [
		{ path: "/", component: MyTasks }
		, { path: "/projects", component: Projects }
		, { path: "/tasks", component: Tasks }
		, { path: "/kanban", component: Kanban }
		, { path: "/gant", component: Gant }
		, { path: "/profile", component: Profile }
		
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
	]
});