import { isObject } from "lodash";

export default	class Kanban {
	constructor(task) { this._task = task; }
	get id() { return this._task.code; }
	get name() { return this._task.name; }
	get tag() { return isObject(this._task.root) ? this._task.root.shortname : null; }
	get kanbans() { return this._task.tasks.map( t => new Kanban(t)); }
	get task() { return this._task; }
}