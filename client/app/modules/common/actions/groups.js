import Vue from "vue";
import toastr from "../../../core/toastr";
import { ADD, SELECT, UPDATE } from "../constants/mutationTypes";
import axios from "axios";

const UNCLASSIFIED = "UNCLASSIFIED";

export const NAMESPACE = "/api/groups";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createGroup = ({ commit }, model) => {
	axios.post(NAMESPACE, model).then((response) => {
		let res = response.data;

		if (res.status == 200 && res.data) {
			commit(ADD, res.data);
		}
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});
};

// payload = {
// 	options : {	
//		parent : Task.code
//		, weekly : "yyyy-mm-dd"
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
		} else if (options.daily != undefined) {
			url = `${url}?daily=${options.daily}`;
		}
	} 

	axios.get(url).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			commit(mutation, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const updateGroups = ({ commit }, { moving, from, to, index }) => {

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

	axios.put(url).then((response) => {
		let res = response.data;

		console.log("●response", res);

		if (res.data)
			commit(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};