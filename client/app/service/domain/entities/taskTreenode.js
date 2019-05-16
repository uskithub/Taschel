import Treenode from "plugins/gantt/entities/treenode";

export default class TaskTreenode extends Treenode {
	constructor(task) {
		super();
		this._task = task;
		this._subtrees = task.tasks.map(t => new TaskTreenode(t));
	}
	get task() { return this._task; }
	get id() { return this._task.code; }
	get name() { return this._task.name; }
	get subtrees() { return this._subtrees; }
}