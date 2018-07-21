// DDD: Infrastracture

import { METHOD, api } from "../../../../system/fundamentals/api";
import { assign } from "lodash";
const NAMESPACE = "/api/tasks";


// payload = {
// 	options : {	
//		taskType : "project"
//    	, user : People.code
//    	, root : Task.code
//    	, populateParent : true
// 	}
//	, mutation : "LOAD"
// }
const get = options => {
	let url = NAMESPACE;

	if (options.taskType != undefined) {
		url = `${url}?type=${options.taskType}`;
	} else if (options.user != undefined) {
		url = `${url}?user_code=${options.user}`;
	} else if (options.root != undefined) {
		url = `${url}?root_code=${options.root}`;
	}

	return api(METHOD.get, url);
};

const post = rawValues => {
	return api(METHOD.post, NAMESPACE, rawValues);
};

const patch = rawValues => {
	return api(METHOD.patch, NAMESPACE, rawValues);
};

export default {
	get
	, post
	, patch
};