import Kanban from "./kanban";

export default class Board {
	constructor(group) { this._group = group; }
	get id() { return this._group.code; }
	get name() { return this._group.name; }
	get kanbans() { return this._group.tasks.map( t => new Kanban(t)); }
	get group() { return this._group; }
}