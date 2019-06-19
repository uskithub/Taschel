import Vue from "vue";
import { cloneDeep } from "lodash";

import ReviewItem from "./reviewItem";

const _ = Vue.prototype._;

export default class WeeklyReview {

	constructor(rawValues) {
		this._rawValues = rawValues;
		this._items = rawValues.items.map(item => new ReviewItem(item));
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get week() { return this._rawValues.week; }
	get items() { return this._items; }
	get author() { return this._rawValues.author.username; }

}