"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../modules/home";
import Projects from "../modules/projects"; 
import Tasks from "../modules/tasks";
import Kanban from "../modules/kanban"; 
import MyTasks from "../modules/mytasks";
import Gant from "../modules/gant";
import Counter from "../modules/counter";
import Devices from "../modules/devices";
import Posts from "../modules/posts";
import Profile from "../modules/profile";

Vue.use(VueRouter);

export default new VueRouter({
	mode: "hash",
	routes: [
		{ path: "/", component: Home }
		, { path: "/projects", component: Projects }
		, { path: "/tasks", component: Tasks }
		, { path: "/kanban", component: Kanban }
		, { path: "/mytasks", component: MyTasks }
		, { path: "/gant", component: Gant }
		, { path: "/devices", component: Devices }
		, { path: "/posts", component: Posts }
		, { path: "/counter", component: Counter }
		, { path: "/profile", component: Profile }
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
	]
});