import WeeklyKanban from "./weeklyKanban";
import Layer from "plugins/kanban/entities/layer";

export default class WeeklyLayer extends Layer {
	constructor(group, iskanbanRemovable = true) {
		super();
		this._group = group; 
		this._iskanbanRemovable = iskanbanRemovable; 
	}
	get id() { return this._group.code; }
	get name() { return this._group.name; }
	get kanbans() { return this._group.tasks.map( t => new WeeklyKanban(t)); }
	get group() { return this._group; }
	get removable() { return this._iskanbanRemovable; }
}