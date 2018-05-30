import { INITIALIZE, PUSH_CRUMB, POP_CRUMB, SET_WAY_BACK, CLEAR_CRUMB } from "../mutationTypes";

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
			console.log("goTo", state.breadcrumb);
		}
		, [POP_CRUMB] (state) {
			let returnFrom = state.breadcrumb.pop();
			console.log("returnFrom: ", returnFrom);
		}
		, [SET_WAY_BACK] (state, func) {
			if (state.breadcrumb.length > 0) {
				const idx = state.breadcrumb.length-1;
				state.breadcrumb[idx].back = () => {
					func();
					state.breadcrumb[idx].back = null;
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
		, setWayBackOnPreviousCrumb : ({ commit }, func) => {
			commit(SET_WAY_BACK, func);
		}
		, clearCrumb : ({ commit }) => {
			commit(CLEAR_CRUMB);
		}
	}
};