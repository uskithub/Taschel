
import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";

const NAMESPACE = "/api/comments";

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createComment = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

