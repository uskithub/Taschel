import Vue from "vue";
import { cloneDeep } from "lodash";

import Task from "./task";

const _ = Vue.prototype._;

export default class Group {

	constructor(rawValues, projects) {
		this._rawValues = rawValues;
		this._tasks = rawValues.children.map(task => {
			return new Task(task, projects);
		});
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get type() { return this._rawValues.type; }
	get name() { return this._rawValues.name; }
	get purpose() { return this._rawValues.purpose; }
	get author() { return this._rawValues.author.username; }
	get tasks() { return this._tasks; }

}
