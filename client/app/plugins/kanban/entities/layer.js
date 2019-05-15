import Kanban from "./kanban";

export default class Layer {
	constructor(group, iskanbanRemovable = true) { 
		this._group = group; 
		this._iskanbanRemovable = iskanbanRemovable; 
	}
	get id() { return this._group.code; }
	get name() { return this._group.name; }
	get kanbans() { return this._group.tasks.map( t => new Kanban(t)); }
	get group() { return this._group; }
	get removable() { return this._iskanbanRemovable; }
}