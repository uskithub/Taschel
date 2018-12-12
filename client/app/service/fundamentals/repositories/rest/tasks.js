// DDD: Infrastracture

import { METHOD, api } from "../../../../system/fundamentals/api";
import { assign } from "lodash";
const NAMESPACE = "/api/tasks";


// payload = {
// 	options : {	
//		taskType : "project"
//    	, user : People.code
// 	}
//	, mutation : "LOAD"
// }
const get = options => {

	if (options.code) {
		let url = `${NAMESPACE}/${options.code}`;
		return api(METHOD.get, url);	
	}

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

const put = rawValues => {
	return api(METHOD.put, NAMESPACE, rawValues);
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