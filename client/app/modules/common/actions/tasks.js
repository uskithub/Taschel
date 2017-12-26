import Vue from "vue";
import { METHOD, api } from "../api";

import toastr from "../../../core/toastr";
import axios from "axios";

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

// actionは非同期処理を実行する際に使う。
// action自体はstateの変更はしない。
// stateの変更にはmutationをcommitすることで行うこと。

// { commit } はES2015 の引数分割束縛（argument destructuring）という文法

export const createTask = ({ commit }, { model, mutation }) => {
	return api(METHOD.post, NAMESPACE, model)
	.then(data => {
		console.log(`● !!created mutation: ${ mutation }`, data);
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
		console.log(`● !!read mutation: ${ mutation }`, data);
		if (mutation)
			// 各Pageにアサインされたactionからsharedのmutationへcommitをかのうにするため、roo:trueとしている
			commit(mutation
				, (options && options.populateParent) ? data.map(d => recursiveSetParentReference(d)) : data
				, { root : (mutation.indexOf("/") > -1) }
			);
	});
};

export const updateTask = ({ commit }, { model, mutation }) => {
	return api(METHOD.put, NAMESPACE + "/" + model.code, model)
	.then(data => {
		console.log(`● !!updated mutation: ${ mutation }`, data);
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

export const deleteTask = ({ commit }, { model, mutation }) => {
	return api(METHOD.delete, NAMESPACE + "/" + model.code)
	.then(data => {
		console.log(`● !!deleted mutation: ${ mutation }`, data);
		if (mutation)
			commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
	});
};

// TODO: state（に保存されているtask）の更新を直に行ってしまっているので、その部分はmutationでやるべき
export const arrangeTask = ({ commit }, { moving, target, type }) => {
	console.log("● arrange", moving, target, type);

	let targetParentCode = target.parent.code;

	// 循環参照を断ち切る
	// TODO: cloneするべきか
	let movingParent = moving.parent;
	let targetParent = target.parent;
	moving = recursiveRevertParentReference(moving);

	console.log("###", moving.code, target, targetParent);

	if (type == "above") {
        // movingがtargetの兄になる
        // - (moving->parent).cildrenからmovingを削除
		// - moving.parentにtarget.parentを設定
		// - (target->parent).childrenにmovingを追加（targetの前に）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
        //    - targetのparent（children）
		axios.put(`${NAMESPACE}/${moving.code}?arrange=above&target=${target.code}&targetParent=${targetParentCode}`, moving).then((response) => {
			let res = response.data;
	
			if (res.data) {
				// ClientはClientで入れ替えをしている
				movingParent.children = movingParent.children.filter(c => c.code != moving.code);
				moving.parent = target.parent;
				recursiveSetParentReference(moving);
				let index = 0;
				for (let i in target.parent.children) {
					let c = target.parent.children[i];
					if (c.code == target.code) {
						break;
					}
					index++;
				}
				target.parent.children.splice(index, 0, moving);
				
				//console.log("above: after ", index,  target.parent.children.map(c => c.name));
			}
		}).catch((response) => {
			console.log("● err", response);
			moving.parent = movingParent;
			recursiveSetParentReference(moving);
			if (response.data.error)
				toastr.error(response.data.error.message);
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
		axios.put(`${NAMESPACE}/${moving.code}?arrange=into&target=${target.code}`, moving).then((response) => {
			let res = response.data;

			if (res.data) {
				// ClientはClientで入れ替えをしている
				movingParent.children = movingParent.children.filter(c => c.code != moving.code);
				moving.parent = target;
				recursiveSetParentReference(moving);
				target.children.unshift(moving);
				
				// console.log("into: after ", target.children.map(c => c.name));
			}
		}).catch((response) => {
			console.log("● err", response);
			moving.parent = movingParent;
			recursiveSetParentReference(moving);
			if (response.data.error)
				toastr.error(response.data.error.message);
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
		axios.put(`${NAMESPACE}/${moving.code}?arrange=below&target=${target.code}&targetParent=${targetParentCode}`, moving).then((response) => {
			let res = response.data;

			if (res.data) {
				// ClientはClientで入れ替えをしている
				movingParent.children = movingParent.children.filter(c => c.code != moving.code);
				moving.parent = target.parent;
				recursiveSetParentReference(moving);
				let index = 0;
				for (let i in target.parent.children) {
					let c = target.parent.children[i];
					if (c.code == target.code) {
						break;
					}
					index++;
				}
				target.parent.children.splice(index+1, 0, moving);
				
				//console.log("below: after ", index,  target.parent.children.map(c => c.name));
			}
		}).catch((response) => {
			console.log("● err", response);
			moving.parent = movingParent;
			recursiveSetParentReference(moving);
			if (response.data.error)
				toastr.error(response.data.error.message);
		});
	}
};
