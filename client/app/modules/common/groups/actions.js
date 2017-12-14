import Vue from "vue";
import toastr from "../../../core/toastr";
import axios from "axios";

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
            commit(SELECT, res.data, false);
		}
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});
};

export const readGroups = ({ commit }, mutation) => {
	axios.get(NAMESPACE).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			commit(mutation, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

