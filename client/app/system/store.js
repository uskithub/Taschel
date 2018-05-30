import Vue from "vue";
import Vuex from "vuex";

import session from "../service/fundamentals/stores/session";
import old from "../modules/store";


Vue.use(Vuex);

export default new Vuex.Store({
	strict: true
	, modules: {
		session
		, old
	}
});