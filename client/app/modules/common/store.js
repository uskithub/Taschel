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
		let update = function(model, parent) {
			console.log("◯ check", model);
			if (model.code == parent.code) {
				console.log("● みつけた！", model);
				return parent;
			}
			if (model.children == undefined || model.children.length == 0) {
				return model;
			} else {
				for (let i in model.children) {
					let c = model.children[i];
					if (c.code == parent.code) {
						console.log("● みつけた！", c);
						model.children[i] = parent;
						break;
					}
					model.children[i] = update(c, parent);
				}
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
		
		// let updated = state.projects.map(p => {
		// 	if (p.code == state.currentProject) {
		// 		return update(p, parent);
		// 	} else {
		// 		return p;
		// 	}
		// });
		// state.projects.splice(0);
		// state.projects = updated;
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