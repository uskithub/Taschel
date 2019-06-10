import Kanban from "plugins/kanban/entities/kanban";

export default	class WorkKanban extends Kanban {
	constructor(work) { 
		super();
		this._work = work; 
	}
	// Kanban の override
	get id() { return this._work.code; }
	get name() { return this._work.title; }
	get tag() { return null; }
	get content() { return this._work; }
	get styleClass() { return null; }
	get kanbans() { return []; }
}