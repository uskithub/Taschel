// DDD: Infrastracture

import { METHOD, api } from "../../../../../system/fundamentals/api";

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
export const readTasks = ({ commit }, { options, mutation }) => {
	let url = NAMESPACE;

	if (options != undefined) {
		if (options.taskType != undefined) {
			url = `${url}?type=${options.taskType}`;
		} else if (options.user != undefined) {
			url = `${url}?user_code=${options.user}`;
		} else if (options.root != undefined) {
			url = `${url}?root_code=${options.root}`;
		}
	}

	return api(METHOD.get, url)
		.then(data => {
			if (mutation)
				commit(mutation
					, (options && options.populateParent) ? data.map(d => recursiveSetParentReference(d)) : data
					, { root : (mutation.indexOf("/") > -1) }
				);
		});
};