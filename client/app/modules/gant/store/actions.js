import Vue from "vue";
import toastr from "../../../core/toastr";
import { LOAD_PROJECTS, SELECT_PROJECT, DESELECT_PROJECT } from "./types";
import axios from "axios";

export const NAMESPACE = "/api/tasks";

// APIの戻りでは、childrenは実体だが、parentはcodeになっている
// これを再帰的にparentのObject（参照）にしている
let recursiveSetParentReference = function(model) {
	if (model.children == undefined) {
		return model;
	} else {
		model.children = model.children.map((c) => {
			c.parent = model;
			return recursiveSetParentReference(c);
		});
		return model;
	}
};

export const selectProject = ({ commit }, row) => {
	commit(SELECT_PROJECT, row);
};

export const deselectProject = ({ commit }) => {
	commit(DESELECT_PROJECT);
};

export const downloadProjects = ({ commit }) => {
	axios.get(`${NAMESPACE}?type=project`).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			commit(LOAD_PROJECTS, res.data.map(d => recursiveSetParentReference(d)));
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const move = ({ commit }, moveContext) => {
	// commit(DESELECT_PROJECT);
	console.log("● move", moveContext.moving.name, moveContext.target.name, moveContext.type);

	let moving = moveContext.moving;
	let target = moveContext.target;

	if (moveContext.type == "up") {
        console.log("up =====");
        // movingがtargetの兄になる
        // - movingのparentのcildrenからmovingを削除
        // - targetのparentをmovingのparentに
        // - targetのparentのchildrenにmovingを追加（targetの前に）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
		//    - targetのparent（children）
		moving.parent.children = moving.parent.children.filter(c => c.code != moving.code);
		moving.parent = target.parent;
		let index = 0;
		for (let c in target.parent.children) {
			if (c.code == target) {
				break;
			}
			index++;
		}
		target.parent.children.splice(index, 0, moving);
        
	} else if (moveContext.type == "into") {
		console.log("into =====");
        // movingがtargetの子になる
        // - movingのparentのcildrenからmovingを削除
        // - targetをmovingのparentに
        // - targetのchildrenにmovingを追加（先頭）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
        //    - target（children）
		
	} else {
		console.log("else =====", moveContext.type);
        // movingがtargetの弟になる
        // - movingのparentのcildrenからmovingを削除
        // - targetのparentをmovingのparentに
        // - targetのparentのchildrenにmovingを追加（targetの後に）
        // 更新対象：
        //    - movingのparent（children）
        //    - moving（parent）
        //    - targetのparent（children）
		moving.parent.children = moving.parent.children.filter(c => c.code != moving.code);
		moving.parent = target.parent;
		let index = 0;
		for (let c in target.parent.children) {
			if (c.code == target) {
				break;
			}
			index++;
		}
		target.parent.children.splice(index+1, 0, moving);
	}
};

