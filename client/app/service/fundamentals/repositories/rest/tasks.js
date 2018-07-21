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
	
	let params = [];

	if (options.taskType !== undefined) {
		params.push(`type=${options.taskType}`);
	} 
	if (options.user !== undefined) {
		params.push(`user_code=${options.user}`);
	}

	let url = `${NAMESPACE}?${params.join("&")}`;

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