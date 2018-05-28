import { cloneDeep } from "lodash";

export default class Project {

	constructor(rawValues) {
		this._rawValues = rawValues;
	}

	get rawValues() {
		return cloneDeep(this._rawValues);
	}

	get code() {
		return this._rawValues.code; 
	}

	get name() {
		return this._rawValues.name;
	}

}
