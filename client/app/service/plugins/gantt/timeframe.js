export default class Timeframe {

	constructor(task, parentTimeframe) {
		this._task = task;
		this._parentTimeframe = parentTimeframe;

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