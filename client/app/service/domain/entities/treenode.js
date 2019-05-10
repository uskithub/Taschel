export default class Treenode {
	constructor(task) {
		this._task = task;
		this._subtree = task.tasks.map(t => new Treenode(t));
	}
	get task() { return this._task; }
	get id() { return this._task.code; }
	get name() { return this._task.name; }
	get subtree() { return this._subtree; }
}