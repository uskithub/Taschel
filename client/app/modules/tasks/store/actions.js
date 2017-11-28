import Vue from "vue";
import toastr from "../../../core/toastr";
import { LOAD_PROJECTS, LOAD_TASKS, ADD, SELECT_TASKS, SELECT_PROJECT, DESELECT_PROJECT, DESELECT_TASK, CLEAR_SELECT, UPDATE, REMOVE } from "./types";
import axios from "axios";

export const NAMESPACE = "/api/tasks";

export const selectProject = ({ commit }, row) => {
	commit(SELECT_PROJECT, row);
	console.log(row.code, row);
	axios.get(NAMESPACE).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			commit(LOAD_TASKS, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});
};

export const selectTasks = ({ commit }, row, multiSelect) => {
	commit(SELECT_TASKS, row, multiSelect);
};

export const deselectProject = ({ commit }) => {
	commit(DESELECT_PROJECT);
	commit(LOAD_TASKS, []);
};

export const deselectTask = ({ commit }, row) => {
	commit(DESELECT_TASK, row);
};

export const clearSelection = ({ commit }) => {
	commit(CLEAR_SELECT);
};

export const downloadProjects = ({ commit }) => {
	axios.get(`${NAMESPACE}?type=project`).then((response) => {
		let res = response.data;
		if (res.status == 200 && res.data)
			commit(LOAD_PROJECTS, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const saveRow = ({ commit }, model) => {
	axios.post(NAMESPACE, model).then((response) => {
		let res = response.data;

		if (res.status == 200 && res.data)
			created({ commit }, res.data, true);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});		
};

export const created = ({ commit }, row, needSelect) => {
	commit(ADD, row);
	if (needSelect)
		commit(SELECT, row, false);
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
