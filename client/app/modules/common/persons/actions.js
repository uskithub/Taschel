import Vue from "vue";
import toastr from "../../../core/toastr";
import axios from "axios";

export const NAMESPACE = "/api/persons";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const readUsers = ({ commit }, { mutation }) => {
	axios.get(NAMESPACE).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
		// 各Pageにアサインされたactionからsharedのmutationへcommitをかのうにするため、roo:trueとしている
			commit(mutation
				, res.data
				, { root : true }
			);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

