import moment from "moment";
import { cloneDeep } from "lodash";

export default class Task {

	constructor(rawValues) {
		this._rawValues = rawValues;
	}

	get rawValues() {
		return cloneDeep(this._rawValues);
	}

	get code() { return this._rawValues.code; }

	get type() { return this._rawValues.type; }
	set type(type) { return this._rawValues.type = type; }

	get shortname() { return this._rawValues.shortname; }

	get name() { return this._rawValues.name; }
	set name(name) { return this._rawValues.name = name; }

	get purpose() { return this._rawValues.purpose; }
	set purpose(purpose) { return this._rawValues.purpose = purpose; }

	get goal() { return this._rawValues.goal; }
	set goal(goal) { return this._rawValues.goal = goal; }

	get author() { return this._rawValues.author.username; }

	get lastCommunication() { return this._rawValues.lastCommunication; }

}
