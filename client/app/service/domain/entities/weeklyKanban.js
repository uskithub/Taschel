import Kanban from "plugins/kanban/entities/kanban";

import { isObject } from "lodash";

export default	class WeeklyKanban extends Kanban {
	constructor(task) { 
		super();
		this._task = task; 
	}
	// Kanban の override
	get id() { return this._task.code; }
	get name() { return this._task.name; }
	get tag() { return isObject(this._task.root) ? this._task.root.shortname : null; }
	get kanbans() { return this._task.tasks.map( t => new WeeklyKanban(t)); }

	// extension
	get task() { return this._task; }
}