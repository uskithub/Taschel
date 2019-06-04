import axios from "axios";
import toastr from "system/toastr";

import { isObject } from "lodash";

export const METHOD = {
	get : "get"
	, post : "post"
	, put : "put"
	, patch : "patch"
	, delete : "delete"
};

const unpopulate = (model) => {
	if (isObject(model.root)) {
		model.root = model.root.code;
	}
	if (isObject(model.parent)) {
		model.parent = model.parent.code;
	}
	return model;
};

export const api = (method, url, model) => {
	if (model) model = unpopulate(model);

	return new Promise((resolve, reject) => {
		if (!METHOD[method]) {
			reject(new Error(`Unknown HTTP Method was called: ${ method }`));
			return;
		}
		axios[method] (url, model).then(response => {
			let res = response.data;
			if (res.status == 200 && res.data) {
				resolve(res.data);
			} else {
				reject(new Error(`response status is ${res.status}. ${res.error.message}`));
			}
		}).catch(error => {
			if (error instanceof TypeError) {	
				reject(error);
			} else if (error instanceof Error) {
				error.message = `${error.message} (type: ${error.response.data.error.type}, message: ${error.response.data.error.message})`;
				reject(error);
			} else {
				reject(new Error(`error: ${error}`));
			}
		});
	}).catch(error => {
		console.error(`API ERROR: [${method}] ${url}`, model, error);
		toastr.error(error.message);
	});
};