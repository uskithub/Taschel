import { METHOD, api } from "./restClient";

const NAMESPACE = "/api/profiles";

const get = (userCode) => {
	return api(METHOD.get, `${NAMESPACE}/${userCode}`);
};

export default {
	get
};