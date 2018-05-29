import { cloneDeep } from "lodash";

export default class Project {

	constructor(rawValues) {
		this._rawValues = rawValues;
	}

	get rawValues() { return cloneDeep(this._rawValues); }

	get code() { return this._rawValues.code;  }

	get projectType() { return this._rawValues.projectType; }
	set projectType(projectType) { return this._rawValues.projectType = projectType; }

	get shortname() { return this._rawValues.shortname; }
	set shortname(shortname) { return this._rawValues.shortname = shortname; }

	get name() { return this._rawValues.name; }
	set name(name) { return this._rawValues.name = name; }

	get purpose() { return this._rawValues.purpose; }
	set purpose(purpose) { return this._rawValues.purpose = purpose; }

	get goal() { return this._rawValues.goal; }
	set goal(goal) { return this._rawValues.goal = goal; }

	get description() { return this._rawValues.description; }
	set description(description) { return this._rawValues.description = description; }
}
