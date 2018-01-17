import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";

const NAMESPACE = "/api/works";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createWork = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	options : {	
//    	user_code : People.code
//    	, week : "yyyy-MM-dd
// 	}
//	, mutation : "LOAD"
// }
export const readWorks = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;

	if (options != undefined && options.user_code != undefined && options.week != undefined) {
		url = `${url}?user_code=${options.user_code}&week=${options.week}`;
	} 

	return api(METHOD.get, url)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	model : work
//	, mutation : "UPDATE"
// }
export const updateWork = ({ commit }, { model, mutation }) => {
	return api(METHOD.put, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

export const deleteWork = ({ commit }, { model, mutation }) => {
	return api(METHOD.delete, NAMESPACE + "/" + model.code)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};