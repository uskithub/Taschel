import Layer from "plugins/kanban/entities/layer";
import ReviewKanban from "./reviewKanban";

export default class ReviewLayer extends Layer {

	constructor(code, name, reviews, iskanbanRemovable = true) {
		super();
		this._code = code;
		this._name = name;
		this._reviews = reviews;
		this._iskanbanRemovable = iskanbanRemovable; 
	}
	// Layer の override
	get id() { return this._code; }
	get name() { return this._name; }
	get kanbans() { return this._reviews.map( r => new ReviewKanban(r)); }
	get removable() { return this._iskanbanRemovable; }

	// extension
	get group() { return this._group; }
}