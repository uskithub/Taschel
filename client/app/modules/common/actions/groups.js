import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";
import { ADD, SELECT, UPDATE } from "../constants/mutationTypes";

const UNCLASSIFIED = "UNCLASSIFIED";

const NAMESPACE = "/api/groups";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createGroup = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	options : {	
//		parent : Task.code
//		, weekly : "yyyy-mm-dd"
//		, user_code : User.code
// 	}
//	, mutation : "LOAD"
// }
export const readGroups = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;
	
	if (options != undefined) {
		if (options.parent != undefined) {
			url = `${url}?parent_code=${options.parent}`;
		} else if (options.weekly != undefined) {
			url = `${url}?weekly=${options.weekly}`;
			if (options.user_code != undefined) {
				url = `${url}&user_code=${options.user_code}`;
			}
		} else if (options.daily != undefined) {
			url = `${url}?daily=${options.daily}`;
			if (options.user_code != undefined) {
				url = `${url}&user_code=${options.user_code}`;
			}
		}
	} 

	return api(METHOD.get, url)
	.then(data => {
		if (mutation)
			// 各Pageにアサインされたactionからsharedのmutationへcommitを可能にするため、roo:trueとしている
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// { moving: { type: "task", code: el.dataset.code }
//	, from: { type: source.dataset.type, code: source.dataset.code }
//	, to: { type: target.dataset.code, code: target.dataset.code }
//	, index: index 
// }
export const updateGroups = ({ commit }, { moving, from, to, index, parent_code, weekly, mutation }) => {
	console.log("● do update", { moving, from, to, index });

	// ① from, to => UNCLASSIFIED|task, group	/api/groups/${to}?task=${moving}&index=${index}
	//		-> [toDoc]
	// ② from, to => group, UNCLASSIFIED|task	/api/groups/${from}?task=${moving}&index=${index}&remove=true
	//		-> [fromDoc]
	// ③ from, to => group, group				/api/groups/${to}?task=${moving}&index=${index}&from=${from}
	//	  1. from, to => xxx, yyy
	//		-> [toDoc, fromDoc];
	//	  2. from, to => xxx, xxx
	//		-> [fromDoc];

	let url = NAMESPACE;

	if (from.type == "task" || from.code == "UNCLASSIFIED") {
		url = `${url}/${to.code}?task=${moving.code}&index=${index}`;
	} else if (to.type == "task" || to.code == "UNCLASSIFIED") {
		url = `${url}/${from.code}?task=${moving.code}&index=${index}&remove=true`;
	} else {
		url = `${url}/${to.code}?task=${moving.code}&index=${index}&from=${from.code}`;
	}

	if (parent_code) { url = `${url}&parent_code=${parent_code}`; }
	if (weekly) { url = `${url}&weekly=${weekly}`; }

	return api(METHOD.put, url)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};