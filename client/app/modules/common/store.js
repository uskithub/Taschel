import { LOAD_PROJECTS, LOAD_USERS, UPDATE, SET_CURRENT_PROJECT, SHOW_POPUP, HIDE_POPUP } from "./constants/mutationTypes";

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
	, [UPDATE] (state, { parent, child }) {
		// stateが変更されたかの判定が凄いシビア
		// parentの挿げ替えかchildの追加でどちらでも状態を更新できるが、
		// 前者だとroot以下にタスクを追加した場合、更新がされなかった（root以外では大丈夫だった）
		let update = function(model) {
			if (model.code == parent.code) {
				model.children.push(child)
				return model;
			}
			if (model.children == undefined || model.children.length == 0) {
				return model;
			} else {
				model.children = model.children.map( c => {
					return update(c, parent);
				});
				return model;
			}
		};

		for (let i in state.projects) {
			let p = state.projects[i];
			if (p.code == state.currentProject) {
				state.projects[i] = update(p, parent);
				break;
			}
		}
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
		};
	}
	, [HIDE_POPUP] (state) {
		state.popupSchema = {
			isVisible : false
			, title : null
			, message : null
			, buttons : []
		};
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