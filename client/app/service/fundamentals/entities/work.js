import Vue from "vue";
import { cloneDeep } from "lodash";

const _ = Vue.prototype._;

export default class Work {

	constructor(rawValues) {
		this._rawValues = rawValues;
		// this._tasks = rawValues.children.map(task => {
		// 	return new Task(task);
		// });
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get title() { return this._rawValues.title; }
	get start() { return this._rawValues.start; }
	get end() { return this._rawValues.end; }
	get purpose() { return this._rawValues.purpose; }
	get status() { return this._rawValues.stauts; }
	get author() { return this._rawValues.author.username; }
}
