import { METHOD, api } from "./restClient";

const NAMESPACE= "/api/sessions";

const get = () => {
	return api(METHOD.get, `${NAMESPACE}/me`);
};

export default {
	get
};