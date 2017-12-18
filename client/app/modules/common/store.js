import { LOAD_PROJECTS, LOAD_USERS, SET_CURRENT_PROJECT, SHOW_POPUP, HIDE_POPUP } from "./constants/mutationTypes";

const state = {
	projects: []
	, users: []
	, currentProject: null  // task.code 
	, popupSchema: {
		isVisible : true
		, title : "まじか"
		, message : "それはまた"
		, buttons : [
			{
				type: "SUCCESS"
				, label : "いいよ"
				, action() {
					alert("hoge");
				}
			}
		]
	}
};

const getters = {
	projects(state) { return state.projects; }
	, users(state) { return state.users; }
	, currentProject(state) { return state.currentProject; }
	, popupSchema(state) { return state.popupSchema; }
};

const mutations = {
	[LOAD_PROJECTS] (state, models) {
		state.projects.splice(0);
		state.projects.push(...models);
	}
	, [LOAD_USERS] (state, models) {
		state.users.splice(0);
		state.users.push(...models);
	}
	, [SET_CURRENT_PROJECT] (state, code) {
		state.currentProject = code;
	}
	, [SHOW_POPUP] (state, { title, message, buttons }) {
		console.log(buttons);
		state.popupSchema = {
			isVisible : true
			, title : title
			, message : message
			, buttons : buttons
		}
	}
	, [HIDE_POPUP] (state) {
		state.popupSchema = {
			isVisible : false
			, title : null
			, message : null
			, buttons : []
		}
	}
};

export default {
	namespaced : true
	, state
    , getters
    // sharedにはactionを持たせないこと
    //, actions
	, mutations
};