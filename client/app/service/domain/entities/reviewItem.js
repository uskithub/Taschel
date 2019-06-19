import Vue from "vue";
import { cloneDeep } from "lodash";

import Work from "./work";
import Review from "./review";

const _ = Vue.prototype._;

export default class ReviewItem {

	constructor(rawValues) {
		this._rawValues = rawValues;
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get week() { return this._rawValues.week; }
	get type() { return this._rawValues.type; }
	get review() { return this._rawValues.review; }
	get work() { return this._rawValues.work; }
	get abstraction() { return this._rawValues.abstraction; }
	get diversion() { return this._rawValues.diversion; }
	get author() { return this._rawValues.author.username; }

}