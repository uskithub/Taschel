// Domain層に置くべきメソッドたち
// TODO: 最終的にどう整理するかは別途考える

// taskの再配置が業務ルール的にOKかどうか検査して返します
// ① from, to => UNCLASSIFIED|task, group	/api/groups/${to}?task=${moving}&index=${index}
//		-> [toDoc]
// ② from, to => group, UNCLASSIFIED|task	/api/groups/${from}?task=${moving}&index=${index}&remove=true
//		-> [fromDoc]
// ③ from, to => group, group				/api/groups/${to}?task=${moving}&index=${index}&from=${from}
//	  1. from, to => xxx, yyy
//		-> [toDoc, fromDoc];
//	  2. from, to => xxx, xxx
//		-> [fromDoc];
const validateArrange = (groups, task, from, to, index) => {
	// 0) from === to
	//	  OK
	// 1) group ---> group
	//	  OK
	// 2) group ---> task
	//	  OK, only the case that the task is the parent of "to".
	// 3) task ---> group
	//	  NG, the case that "to" is the same as the group on that the task's parent is.
	// 4) task ---> task
	//	  NG

	if (from.type === to.type && from.code === to.code) {
		// 0) from === to
		return true;
	}

	if (from.type === "group" && to.type === "group") {
		// 1) group ---> group
		return true;

	} else if (from.type === "group") {
		// 2) group ---> task
		return task.parent === to.code;
		
	} else if (from.type === "task" && to.type === "group") {
		// 3) task ---> group
		return !groups.filter(g => {
			if (g.code === to.code) {
				return g.tasks.filter(t => t.code === from.code).length > 0;
			}
			return false;
		}).length > 0;
		
	} else {
		// 4) task ---> task
		return false;
	}
	return false;
};

export default {
	validateArrange
}