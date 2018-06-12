import Vue from "vue";
import moment from "moment";
import { cloneDeep, isObject, isArray } from "lodash";
import { validators } from "vue-form-generator";

import Task from "./task";

import { taskProperties } from "../../constants";

const _ = Vue.prototype._;

export default class Group {

	constructor(rawValues) {
		this._rawValues = rawValues;
		this._tasks = rawValues.children.map(task => {
			return new Task(task);
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
