import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";

export const NAMESPACE = "/api/reviews";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createReview = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	options : {	
//    	user : People.code
//    	, week : "YYYY-MM-DD"
// 	}
//	, mutation : "LOAD"
// }
export const readReviews = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;

	if (options != undefined && options.user != undefined && options.week != undefined) {
		url = `${url}?user=${options.user}&week=${options.week}`;
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
export const updateReview = ({ commit }, { model, mutation }) => {
	return api(METHOD.put, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};
