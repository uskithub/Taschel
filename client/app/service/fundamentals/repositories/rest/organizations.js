// DDD: Infrastracture

import { METHOD, api } from "../../../../system/fundamentals/api";

const NAMESPACE= "/api/organizations";

const get = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;

	if (options != undefined) {
		if (options.user != undefined) {
			url = `${url}?user_code=${options.user}`;
		}
	}

	return api(METHOD.get, url)
		.then(data => {
			if (mutation)
				commit(mutation
					, data
					, { root : (mutation.indexOf("/") > -1) }
				);
		});
};

const post = ({ commit }, { entity, mutation }) => {
	return api(METHOD.post, NAMESPACE, entity)
		.then(data => {
			if (mutation)
				commit(mutation
					, data
					, { root : (mutation.indexOf("/") > -1) });
		});
};

export default {
	get, post
};