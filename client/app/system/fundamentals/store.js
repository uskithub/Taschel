import { SYSTEM } from "./mutationTypes";

export default {
	state : {
		breadcrumb: []
	}
	, getters : {
		breadcrumb(state) { return state.breadcrumb; }
	}
	, mutations : {
		[SYSTEM.PUSH_CRUMB] (state, crumb) {
			state.breadcrumb.push(crumb);
		}
		, [SYSTEM.POP_CRUMB] (state) {
			let returnFrom = state.breadcrumb.pop();
		}
		, [SYSTEM.SET_WAY_BACK] (state, func) {
			if (state.breadcrumb.length > 0) {
				const idx = state.breadcrumb.length-1;
				state.breadcrumb[idx].didPush = () => {
					func();
					state.breadcrumb[idx].didPush = null;
				};
			}
		}
		, [SYSTEM.SET_SELECTOR] (state, { items, itemDidPush }) {
			if (state.breadcrumb.length > 0) {
				const idx = state.breadcrumb.length-1;
				state.breadcrumb[idx].items = items;
				state.breadcrumb[idx].itemDidPush = itemDidPush;
			}
		}
		, [SYSTEM.CLEAR_CRUMB] (state) {
			state.breadcrumb.splice(0);
		}
	}
	, actions : {
		pushCrumb({ commit }, crumb) {
			commit(SYSTEM.PUSH_CRUMB, crumb);
		}
		, popCrumb({ commit }) {
			commit(SYSTEM.POP_CRUMB);
		}
		, setWayBackOnLastCrumb({ commit }, func) {
			commit(SYSTEM.SET_WAY_BACK, func);
		}
		, setSelectorOnLastCrumb({ commit }, itemsAndHandler) {
			commit(SYSTEM.SET_SELECTOR, itemsAndHandler);
		}
		, clearCrumb({ commit }) {
			commit(SYSTEM.CLEAR_CRUMB);
		}
	}
};