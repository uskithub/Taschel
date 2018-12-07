// DDD: Infrastracture

import { METHOD, api } from "../../../../system/fundamentals/api";
import { assign } from "lodash";
const NAMESPACE = "/api/groups";

const get = options => {
	let url = NAMESPACE;

	if (options.parent != undefined) {
		url = `${url}?parent_code=${options.parent}`;
	} else if (options.week != undefined) {
		url = `${url}?week=${options.week.format("YYYY-MM-DD")}`;
		if (options.user != undefined) {
			url = `${url}&user_code=${options.user}`;
		}
	} else if (options.day != undefined) {
		url = `${url}?day=${options.day.format("YYYY-MM-DD")}`;
		if (options.user != undefined) {
			url = `${url}&user_code=${options.user}`;
		}
	}

	return api(METHOD.get, url);
};

const post = rawValues => {
	return api(METHOD.post, NAMESPACE, rawValues);
};

const put = (group, task, isAdding, index) => {
	let url = `${NAMESPACE}/${group}?task=${task}&isAdding=${isAdding}`;
	if (isAdding) {
		url = `${url}&index=${index}`;
	}
	return api(METHOD.put, url);
};

const patch = rawValues => {
	return api(METHOD.patch, NAMESPACE, rawValues);
};

export default {
	get
	, post
	, put
	, patch
};