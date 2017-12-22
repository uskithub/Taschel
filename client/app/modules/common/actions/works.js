import Vue from "vue";
import toastr from "../../../core/toastr";
import { UPDATE, ADD_WORK, REMOVE, SELECT } from "../constants/mutationTypes";
import axios from "axios";

export const NAMESPACE = "/api/works";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createWork = ({ commit }, model) => {
	axios.post(NAMESPACE, model).then((response) => {
		let res = response.data;

		if (res.status == 200 && res.data) {
			console.log("● created", res.data);		
			commit(ADD_WORK, res.data);
		}
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
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
	
	axios.get(url).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			// 各Pageにアサインされたactionからsharedのmutationへcommitをかのうにするため、roo:trueとしている
			commit(mutation, res.data, { root : true });
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});
};

export const updateWork = ({ commit }, model) => {
	axios.put(NAMESPACE, model).then((response) => {
		let res = response.data;

		if (res.status == 200 && res.data) {
			console.log("● updated", res.data);		
			commit(UPDATE, res.data);
		}
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});
};
