import Vue from "vue";
import Vuex from "vuex";

import session from "../service/fundamentals/stores/session";

Vue.use(Vuex);

export default new Vuex.Store({
	strict: true
	, modules: {
		session
	}
});