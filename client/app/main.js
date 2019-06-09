"use strict";

require("es6-promise/auto");

import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css"; 

import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "application/json";

import Filters from "./system/filters";
import VueI18Next from "./system/i18next.js";

import VueFormGenerator from "vue-form-generator";
import "vue-form-generator/dist/vfg.css";

import VueWebsocket from "vue-websocket";

import "ion-rangeslider";
import "ion-rangeslider/css/ion.rangeSlider.css";
import "ion-rangeslider/css/ion.rangeSlider.skinFlat.css";

import SystemComponents from "system/components/index";
import KanbanPlugin from "plugins/kanban/index";
import GanttPlugin from "plugins/gantt/index";

// import App from "./system/App";
import App from "./system/AppVuetify";

Vue.use(Vuetify);
Vue.use(Filters);

Vue.use(VueFormGenerator);
Vue.use(VueWebsocket);

//Vue.http.headers.common['X-CSRF-TOKEN'] = $('input[name="csrf"]').val();

// Register i18next localization module. We need to 
// wait it before start the application!
Vue.use(VueI18Next, (i18next) => {
	let router = require("./system/router").default; // Load only after i18next initialized
	let store = require("./system/store").default; // Load only after i18next initialized

	new Vue({
		el: "#app"
		, components: {
			App
		}
		, router
		, store
		, render: h => h("app")
	});
});

Vue.use(SystemComponents);
Vue.use(GanttPlugin);
Vue.use(KanbanPlugin);
