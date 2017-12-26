import axios from "axios";
import toastr from "../../core/toastr";

export const METHOD = {
	get : "get"
	, post : "post"
	, put : "put"
	, delete : "delete"
};

export const api = (method, url, model) => {
	return new Promise((resolve, reject) => {
		if (!METHOD[method]) {
			reject(new Error(`Unknown HTTP Method was called: ${ method }`));
			return;
		}
		axios[method] (url, model).then((response) => {
			let res = response.data;
			if (res.status == 200 && res.data) {
				resolve(res.data);
			} else {
				reject(new Error(`response status is ${res.status}. res.data is ${res.data}`));
			}
		}).catch((response) => {
			if (response instanceof Error) {
				reject(response);
			} else if (response.data && response.data.error) {
				reject(new Error(response.data.error));
			} else {
				reject(new Error(`response: ${response}`));
			}
		});
	})
	.catch(error => {
		console.log(error);
		toastr.error(error.message);
	});
};