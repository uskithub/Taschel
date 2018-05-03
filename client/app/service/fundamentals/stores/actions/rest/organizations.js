// DDD: Infrastracture

import { METHOD, api } from "../../../../../system/fundamentals/api";

const NAMESPACE= "/api/organizations";


export const readOrganizations = ({ commit }, { options, mutation }) => {
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