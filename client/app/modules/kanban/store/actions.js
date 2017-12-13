import Vue from "vue";
import toastr from "../../../core/toastr";
import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";
import axios from "axios";

export const NAMESPACE = "/api/groups";

export const selectRow = ({ commit }, row, multiSelect) => {
	commit(SELECT, row, multiSelect);
};

export const clearSelection = ({ commit }) => {
	commit(CLEAR_SELECT);
};

// options = {
//   taskType : "project"
//    , user : People.code
// }
export const downloadTasks = ({ commit }, options) => {
	let url = NAMESPACE;

	if (options !== undefined) {
		if (options.taskType !== undefined) {
			url = `${url}?type=${options.taskType}`;
		} else if (options.user !== undefined) {
			url = `${url}?user_code=${options.user}`;
		}
	} 
	
	axios.get(url).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			commit(LOAD, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const saveRow = ({ commit }, model) => {
	axios.post(NAMESPACE, model).then((response) => {
		let res = response.data;

		console.log("● saveRow on action.js", res);

		if (res.status == 200 && res.data) {
			if (res.data.child) {
				// Breakdownした時はこちらに入る
				brokedown({ commit }, res.data, true);
			} else {
				created({ commit }, res.data, true);
			}
		}
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});		
};

export const created = ({ commit }, row, needSelect) => {
	console.log("● created on action.js", row);
	commit(ADD, row);
	if (needSelect)
		commit(SELECT, row, false);
};

export const brokedown = ({ commit }, result, needSelect) => {
	console.log("● brokedown on action.js", result);
	commit(UPDATE, result.parent);
	commit(ADD, result.child);

	if (needSelect)
		commit(SELECT, result.child, false);
};

export const updateRow = ({ commit }, row) => {
	axios.put(NAMESPACE + "/" + row.code, row).then((response) => {
		let res = response.data;
		if (res.data)
			commit(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const updated = ({ commit }, row) => {
	commit(UPDATE, row);
};

export const removeRow = ({ commit }, row) => {
	axios.delete(NAMESPACE + "/" + row.code).then((response) => {
		commit(REMOVE, row);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});
};

export const removed = ({ commit }, row) => {
	commit(REMOVE, row);
};
