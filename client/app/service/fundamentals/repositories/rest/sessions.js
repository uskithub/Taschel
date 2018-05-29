// DDD: Infrastracture

import { METHOD, api } from "../../../../system/fundamentals/api";

const NAMESPACE= "/api/sessions";

const get = () => {
	return api(METHOD.get, `${NAMESPACE}/me`);
};

export default {
	get
};