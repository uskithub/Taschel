import Vue from "vue";
import toastr from "../../../core/toastr";
import { LOAD_PROJECTS, SELECT_PROJECT, DESELECT_PROJECT } from "./types";
import axios from "axios";

export const NAMESPACE = "/api/tasks";

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
			commit(LOAD_PROJECTS, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};