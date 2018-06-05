import { INITIALIZE, PUSH_CRUMB, POP_CRUMB, SET_WAY_BACK, SET_SELECTOR, CLEAR_CRUMB } from "../mutationTypes";

export default {
	state : {
		breadcrumb: []
	}
	, getters : {
		breadcrumb(state) { return state.breadcrumb; }
	}
	, mutations : {
		[PUSH_CRUMB] (state, crumb) {
			state.breadcrumb.push(crumb);
		}
		, [POP_CRUMB] (state) {
			let returnFrom = state.breadcrumb.pop();
		}
		, [SET_WAY_BACK] (state, func) {
			if (state.breadcrumb.length > 0) {
				const idx = state.breadcrumb.length-1;
				state.breadcrumb[idx].didPush = () => {
					func();
					state.breadcrumb[idx].didPush = null;
				};
			}
		}
		, [SET_SELECTOR] (state, func) {
			if (state.breadcrumb.length > 0) {
				const idx = state.breadcrumb.length-1;
				state.breadcrumb[idx].didPush = () => {
					func();
				};
			}
		}
		, [CLEAR_CRUMB] (state) {
			state.breadcrumb.splice(0);
		}
	}
	, actions : {
		pushCrumb : ({ commit }, crumb) => {
			commit(PUSH_CRUMB, crumb);
		}
		, popCrumb : ({ commit }) => {
			commit(POP_CRUMB);
		}
		, setWayBackOnLastCrumb : ({ commit }, func) => {
			commit(SET_WAY_BACK, func);
		}
		, setSelectorOnLastCrumb : ({ commit }, func) => {
			commit(SET_SELECTOR, func);
		}
		, clearCrumb : ({ commit }) => {
			commit(CLEAR_CRUMB);
		}
	}
};