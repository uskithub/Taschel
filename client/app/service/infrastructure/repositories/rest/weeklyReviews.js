import { METHOD, api } from "system/restClient";

const NAMESPACE = "/api/weeklyReviews";

const get = options => {
	let url = NAMESPACE;

	if (options.week !== undefined) {
		url = `${ url }?week=${ options.week }`;
	}

	return api(METHOD.get, url);
};

const post = rawValues => {
	return api(METHOD.post, NAMESPACE, rawValues);
};

const put = rawValues => {
	return api(METHOD.put, NAMESPACE + "/" + rawValues.code, rawValues);
};

export default {
	get
	, post
	, put
};