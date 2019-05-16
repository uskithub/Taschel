import Kanban from "plugins/kanban/entities/kanban";
import WorkKanban from "./workKanban";

export default class ReviewKanban extends Kanban {
	constructor(review) { 
		super();
		this._review = review; 
	}
	// Kanban の override
	get id() { return this._review.code; }
	get name() { return this._review.date; }
	get tag() { return null; }
	get content() { return this._review.highOrderAwakening; }
	get kanbans() { return this._review.works.map( w => new WorkKanban(w)); }
}