import Kanban from "../../../plugins/kanban/entities/kanban";
import WorkKanban from "./workKanban";
import ReviewKanban from "./reviewKanban";

export default class ReviewItemKanban extends Kanban {
	constructor(reviewItem) { 
		super();
		this._reviewItem = reviewItem;
		console.log("どう", reviewItem);
		this._itemKanban = (reviewItem.type === "review") 
			? new ReviewKanban(reviewItem.review) 
			: new WorkKanban(reviewItem.work); 
	}
	// Kanban の override
	get id() { return this._reviewItem.code; }
	get name() { return this._itemKanban.name; }
	get tag() { return null; }
	get content() { return this._itemKanban.content; }
	get styleClass() { return this._itemKanban.styleClass; }
	get kanbans() { return []; }
}