// DDD: Infrastracture

import { METHOD, api } from "../../../../../system/fundamentals/api";
import { assign } from "lodash";
const NAMESPACE= "/api/tasks";


// payload = {
// 	options : {	
//		taskType : "project"
//    	, user : People.code
//    	, root : Task.code
//    	, populateParent : true
// 	}
//	, mutation : "LOAD"
// }
const curriedGet = ({ preservedOptions, preservedMutation } = {}) => {
	// currying
	return ({ commit }, { options, mutation = preservedMutation }) => {
		let url = NAMESPACE;
		options = assign(preservedOptions || {}, options);

		if (options.taskType != undefined) {
			url = `${url}?type=${options.taskType}`;
		} else if (options.user != undefined) {
			url = `${url}?user_code=${options.user}`;
		} else if (options.root != undefined) {
			url = `${url}?root_code=${options.root}`;
		}

		return api(METHOD.get, url)
			.then(data => {
				if (mutation)
					commit(mutation
						// , (options && options.populateParent) ? data.map(d => recursiveSetParentReference(d)) : data
						, data
						, { root : (mutation.indexOf("/") > -1) }
					);
			});
	};
};

const curriedPut = ({ preservedMutation } = {}) => {
	// currying
	return ({ commit }, { rawValues, mutation = preservedMutation }) => {
		return api(METHOD.put, NAMESPACE + "/" + rawValues.code, rawValues)
			.then(data => {
				if (mutation)
					commit(mutation, data, { root : (mutation.indexOf("/") > -1) });
			});
	};
};

export default {
	curriedGet
	, curriedPut
};