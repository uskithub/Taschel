// DDD: Infrastracture

import { METHOD, api } from "../../../../../system/fundamentals/api";

const NAMESPACE= "/api/sessions";

export const getSession = ({ commit }, { mutation }) => {
	return api(METHOD.get, `${NAMESPACE}/me`)
		.then(data => {
			if (mutation)
				commit(mutation
					, data
					, { root : (mutation.indexOf("/") > -1) }
				);
		});
};