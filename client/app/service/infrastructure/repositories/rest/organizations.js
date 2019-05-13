import { METHOD, api } from "system/restClient";

const NAMESPACE= "/api/organizations";

const get = (userCode) => {
	return api(METHOD.get, `${NAMESPACE}/${userCode}`);
};

export default {
	get
};