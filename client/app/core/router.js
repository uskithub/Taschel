"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../modules/home";
import Projects from "../modules/projects"; 
import Tasks from "../modules/tasks"; 
import MyTasks from "../modules/mytasks";
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
		, { path: "/mytasks", component: MyTasks }
		, { path: "/devices", component: Devices }
		, { path: "/posts", component: Posts }
		, { path: "/counter", component: Counter }
		, { path: "/profile", component: Profile }
		//, { path: "/users", component: User, meta: { needRole: "admin" } }
		// , { path: "*", component: NotFound }
	]
});