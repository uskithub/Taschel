import Layer from "plugins/kanban/entities/layer";
import TaskKanban from "./taskKanban";

export default class TaskLayer extends Layer {
	constructor(group, iskanbanRemovable = true) {
		super();
		this._group = group; 
		this._iskanbanRemovable = iskanbanRemovable; 
	}
	// Layer の override
	get id() { return this._group.code; }
	get name() { return this._group.name; }
	get kanbans() { return this._group.tasks.map( t => new TaskKanban(t)); }
	get removable() { return this._iskanbanRemovable; }

	// extension
	get group() { return this._group; }
}