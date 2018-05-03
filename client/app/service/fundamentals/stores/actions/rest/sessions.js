// DDD: Infrastracture

import { METHOD, api } from "../../../../../system/fundamentals/api";

const NAMESPACE= "/api/sessions";

const get = ({ commit }, { mutation }) => {
	return api(METHOD.get, `${NAMESPACE}/me`)
		.then(data => {
			if (mutation)
				commit(mutation
					, data
					, { root : (mutation.indexOf("/") > -1) }
				);
		});
};

export default {
	get
};