import Vue from "vue";
import Vuex from "vuex";

import session from "service/application/stores/session";
import system from "system/fundamentals/store";

Vue.use(Vuex);

export default new Vuex.Store({
	strict: true
	, modules: {
		session
		, system
	}
});