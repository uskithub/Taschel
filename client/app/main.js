"use strict";

require("es6-promise/auto");

import Vue from "vue";

import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "application/json";

import Filters from "./system/filters";
import VueI18Next from "./system/i18next.js";

import VueFormGenerator from "vue-form-generator";
import VueWebsocket from "vue-websocket";

import fieldMyDateTimePicker from "./core/components/customField/dateTimePicker/index";
import fieldTagsInput from "./core/components/customField/tagsInput/index";

import dailyLoopPlugin from "./service/plugins/dailyLoop/index";
import GanttPlugin from "./service/plugins/gantt/index";

import store from "./system/store";
import App from "./system/App";

Vue.use(Filters);

Vue.component("fieldMyDateTimePicker", fieldMyDateTimePicker);
Vue.component("fieldTagsInput", fieldTagsInput);

Vue.use(VueFormGenerator);
Vue.use(VueWebsocket);

//Vue.http.headers.common['X-CSRF-TOKEN'] = $('input[name="csrf"]').val();

// Register i18next localization module. We need to 
// wait it before start the application!
Vue.use(VueI18Next, (i18next) => {
	let router = require("./system/router").default; // Load only after i18next initialized

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

Vue.use(dailyLoopPlugin);
Vue.use(GanttPlugin);