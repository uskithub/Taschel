import session from "./session";
import profile from "./profile";
import task from "./task";

export default {
	namespaced : true
	, modules: {
		session
		, profile
		, task
	}
};