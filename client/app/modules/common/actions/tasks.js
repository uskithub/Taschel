import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";

import { assign, cloneDeep } from "lodash";

import { ARRANGE_AVOBE, ARRANGE_INTO, ARRANGE_BELOW } from "../constants/mutationTypes";

const NAMESPACE = "/api/tasks";

/* private */

// APIの戻りでは、childrenは実体だが、parentはcodeになっている
// これを再帰的にparentのObject（参照）にしている
let recursiveSetParentReference = function(model) {
	if (model.children == undefined || model.children.length == 0) {
		return model;
	} else {
		model.children = model.children.map((c) => {
			c.parent = model;
			return recursiveSetParentReference(c);
		});
		return model;
	}
};

// 相互参照しているオブジェクトをJSON化しようとすると無限ループになるので、parentをcodeに戻す
let recursiveRevertParentReference = function(model) {
	if (model.parent != -1) {
		model.parent = model.parent.code;
	}
	if (model.children == undefined || model.children.length == 0) {
		return model;
	} else {
		model.children = model.children.map((c) => {
			return recursiveRevertParentReference(c);
		});
		return model;
	}
};

let createUnpopulatedClone = function(model) {
	let _model = cloneDeep(model);
	if (_model.root && _model.root != -1 && _model.root.code) _model.root = _model.root.code;
	if (_model.parent && _model.parent != -1 && _model.parent.code) _model.parent = _model.parent.code;
	_model.children = _model.children.map( c => {
		return (c.code) ? c.code : c;
	});
	return _model;
};

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const checkTask = ({ commit }) => {
	return api(METHOD.get, `${NAMESPACE}?check=true`)
	.then(data => {
		// if (mutation)
		// 	commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

export const createTask = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// payload = {
// 	options : {	
//		taskType : "project"
//    	, user : People.code
//    	, root : Task.code
//    	, populateParent : true
// 	}
//	, mutation : "LOAD"
// }
export const readTasks = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;

	if (options != undefined) {
		if (options.taskType != undefined) {
			url = `${url}?type=${options.taskType}`;
		} else if (options.user != undefined) {
			url = `${url}?user_code=${options.user}`;
		} else if (options.root != undefined) {
			url = `${url}?root_code=${options.root}`;
		}
	}

	return api(METHOD.get, url)
	.then(data => {
		if (mutation)
			// 各Pageにアサインされたactionからsharedのmutationへcommitを可能にするため、roo:trueとしている
			commit(mutation
				, (options && options.populateParent) ? data.map(d => recursiveSetParentReference(d)) : data
				, { root : (mutation.indexOf("/") > -1) }
			);
	});
};

export const updateTask = ({ commit }, { model, mutation }) => {
	return api(METHOD.put, NAMESPACE + "/" + model.code, model)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

export const deleteTask = ({ commit }, { model, mutation }) => {
	return api(METHOD.delete, NAMESPACE + "/" + model.code)
	.then(data => {
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

export const arrangeTask = ({ commit }, { moving, target, type }) => {
	console.log("● arrange", moving, target, type);

	let targetParentCode = target.parent.code;

	const movingParent = moving.parent;
	const targetParent = target.parent;
	const _moving = createUnpopulatedClone(moving);

	console.log("###", _moving, target, targetParent);

	if (type == "above") {
        // movingがtargetの兄になる
        // - (moving->parent).cildrenからmovingを削除
		// - moving.parentにtarget.parentを設定
		// - (target->parent).childrenにmovingを追加（targetの前に）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
		//    - targetのparent（children）
		api(METHOD.put
			, `${NAMESPACE}/${_moving.code}?arrange=above&target=${target.code}&targetParent=${targetParentCode}`
			, _moving)
		.then(data => {
			commit(`shared/${ARRANGE_AVOBE}`
				, [{ exMoving: moving, exMovingParent: movingParent, exTarget: target, exTargetParent: targetParent }, data]
				, { root : true }
			);
		});
        
	} else if (type == "into") {
        // movingがtargetの子になる
        // - (moving->parent).cildrenからmovingを削除
        // - moving.parentにtargetを設定
        // - target.childrenにmovingを追加（先頭）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
		//    - target（children）
		api(METHOD.put
			, `${NAMESPACE}/${_moving.code}?arrange=into&target=${target.code}`
			, _moving)
		.then(data => {
			commit(`shared/${ARRANGE_INTO}`
				, [{ exMoving: moving, exMovingParent: movingParent, exTarget: target }, data]
				, { root : true }
			);	
		});
		
	} else {
        // movingがtargetの弟になる
        // - (moving->parent).cildrenからmovingを削除
        // - moving.parentにtarget.parentを設定
        // - (target->parent).childrenにmovingを追加（targetの後に）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
		//    - targetのparent（children）
		api(METHOD.put
			, `${NAMESPACE}/${_moving.code}?arrange=below&target=${target.code}&targetParent=${targetParentCode}`
			, _moving)
		.then(data => {
			commit(`shared/${ARRANGE_BELOW}`
				, [{ exMoving: moving, exMovingParent: movingParent, exTarget: target, exTargetParent: targetParent }, data]
				, { root : true }
			);
		});
	}
};
