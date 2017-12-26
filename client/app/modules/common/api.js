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
		axios[method] (url, model).then(response => {
			let res = response.data;
			if (res.status == 200 && res.data) {
				resolve(res.data);
			} else {
				reject(new Error(`response status is ${res.status}. ${res.error.message}`));
			}
		}).catch(error => {
			if (error instanceof Error) {
				if (error.response.data && error.response.data.error) {
					error.message = `${error.message} (type: ${error.response.data.error.type}, message: ${error.response.data.error.message})`;
				}
				reject(error);

			} else {
				reject(new Error(`error: ${error}`));
			}
		});
	})
	.catch(error => {
		console.log(error);
		toastr.error(error.message);
	});
};