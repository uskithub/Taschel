import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";

export const NAMESPACE = "/api/works";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createWork = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		console.log(`● !!created mutation: ${ mutation }`, data);
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	options : {	
//    	user : People.code
//    	, week : "yyyy-MM-dd
// 	}
//	, mutation : "LOAD"
// }
export const readWorks = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;

	if (options != undefined && options.user != undefined && options.week != undefined) {
		url = `${url}?user=${options.user}&week=${options.week}`;
	} 

	return api(METHOD.get, url)
	.then(data => {
		console.log(`● !!read mutation: ${ mutation }`, data);
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	diff : {	
//    	code : People.code
//    	, start : "2017-12-25T11:00:00.000Z"
//    	, end : "2017-12-25T11:00:00.000Z"
// 	}
//	, mutation : "UPDATE"
// }
export const updateWork = ({ commit }, { diff, mutation }) => {
	return api(METHOD.put, NAMESPACE, diff)
	.then(data => {
		console.log(`● !!updated mutation: ${ mutation }`, data);
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};
