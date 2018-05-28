// DDD: Infrastracture
// These methods of this file behave like the repository.

import { METHOD, api } from "../../../../../system/fundamentals/api";

const NAMESPACE= "/api/profiles";

const get = ({ commit }, { options, mutation }) => {
	return api(METHOD.get, `${NAMESPACE}/${options.userCode}`)
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