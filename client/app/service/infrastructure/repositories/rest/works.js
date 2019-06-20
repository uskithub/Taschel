import { METHOD, api } from "system/restClient";

const NAMESPACE = "/api/works";

const get = options => {
	let url = NAMESPACE;

	if (options.user !== undefined && options.week !== undefined) {
		url = `${url}?user_code=${options.user}&week=${options.week}`;
	}

	return api(METHOD.get, url);
};

const post = rawValues => {
	return api(METHOD.post, NAMESPACE, rawValues);
};

const put = rawValues => {
	return api(METHOD.put, NAMESPACE + "/" + rawValues.code, rawValues);
};

const _delete = rawValues => {
	return api(METHOD.delete, NAMESPACE + "/" + rawValues.code, rawValues);
};

export default {
	get
	, post
	, put
	, delete: _delete
};