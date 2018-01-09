import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";
import { ADD, SELECT, UPDATE } from "../constants/mutationTypes";
import axios from "axios";

const UNCLASSIFIED = "UNCLASSIFIED";

export const NAMESPACE = "/api/groups";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createGroup = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		console.log(`● !!created mutation: ${ mutation }`, data);
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
		console.log(`● !!read mutation: ${ mutation }`, data);
		if (mutation)
			// 各Pageにアサインされたactionからsharedのmutationへcommitを可能にするため、roo:trueとしている
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

export const updateGroups = ({ commit }, { moving, from, to, index, mutation }) => {
	console.log("● do update", { moving, from, to, index });

	// ① from, to => UNCLASSIFIED, xxx
	//		/api/groups/${to}?task=${moving}&index=${index}&from=UNCLASSIFIED

	// ② from, to => xxx, UNCLASSIFIED
	//		/api/groups/${from}?task=${moving}&index=${index}&to=UNCLASSIFIED

	// ③ from, to => xxx, yyy
	// ④ from, to => xxx, xxx
	//		/api/groups/${to}?task=${moving}&index=${index}&from=${from}

	let url = (to == UNCLASSIFIED) 
		? `${NAMESPACE}/${from}?task=${moving}&index=${index}&to=${UNCLASSIFIED}`
		: `${NAMESPACE}/${to}?task=${moving}&index=${index}&from=${from}`;

	return api(METHOD.put, url)
	.then(data => {
		console.log(`● !!updated mutation: ${ mutation }`, data);
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};