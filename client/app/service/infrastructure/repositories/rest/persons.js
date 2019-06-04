import { METHOD, api } from "system/restClient";

const NAMESPACE = "/api/persons";

const get = options => {
	let url = NAMESPACE;
	return api(METHOD.get, url);
};

export default {
	get
};