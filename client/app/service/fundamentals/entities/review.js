import Vue from "vue";
import { cloneDeep } from "lodash";
import Work from "./work";

const _ = Vue.prototype._;

export default class Review {

	constructor(rawValues) {
		this._rawValues = rawValues;
		this._works = rawValues.works.map(w => {
			return new Work(w);
		});
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get highOrderAwakening() { return this._rawValues.highOrderAwakening; }
	get works() { return this._works; }
	get author() { return this._rawValues.author.username; }

}
