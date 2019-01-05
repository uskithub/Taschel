export default class Timeframe {

	/**
	 * 
	 * 
	 * 
	 * @param {*} treenode 
	 * @param {*} latestFinishTime
	 * @param {*} start 
	 * @param {*} end 
	 * @param {*} cellWidth 
	 */
	constructor(treenode, parent, start, end, cellWidth) {
		this._task = treenode.task;
		this._parent = parent;
		this._start = start;
		this._end = end;
		this._cellWidth = cellWidth;

		this._deadline = null;
		this._manhour = null;
		this._schedule = null;
		this._isCalculated = false;
	}

	get id() { return this._task.code; }
	get name() { return this._task.name; }

	get deadline() { return this._deadline; }
	set deadline(value) { this._deadline = value; }

	get manhour() { return this._manhour; }
	set manhour(value) { this._manhour = value; }

	get schedule() { return this._schedule; }
	set schedule(value) { this._schedule = value; }

	get isCalculated() { return this._isCalculated; }
	set isCalculated(value) { this._isCalculated = value; }

	get width() { 
		// TODO
		return 500; 
	}
	get offset() { 
		// TODO
		return 100; 
	}
}