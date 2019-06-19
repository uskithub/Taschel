import Layer from "plugins/kanban/entities/layer";
import ReviewItemKanban from "./reviewItemKanban";

export default class ReviewItemLayer extends Layer {

	constructor(code, name, items, iskanbanRemovable = true) {
		super();
		this._code = code;
		this._name = name;
		this._items = items;
		this._iskanbanRemovable = iskanbanRemovable; 
	}
	// Layer の override
	get id() { return this._code; }
	get name() { return this._name; }
	get kanbans() { return this._items.map(item => new ReviewItemKanban(item)); }
	get removable() { return this._iskanbanRemovable; }

	// extension
	get group() { return this._group; }
}