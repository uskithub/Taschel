import Vue from "vue";
import { cloneDeep, isArray } from "lodash";
import { validators } from "vue-form-generator";
import Work from "./work";

const _ = Vue.prototype._;

const _fields = {
	goodSide: {
		label: _("GoodSide")
		, table: {
			align: "left"
		}
		, form: {
			type: "textArea"
			, inputType: "text"
			, hint: "Max 500 characters"
			, max: 500
			, placeholder: _("GoodSidePlaceholder")
			, rows: 3
			, default: "ほげほげ"
			, validator: validators.string
		}
	}
	, badSide: {
		label: _("BadSide")
		, table: {
			align: "left"
		}
		, form: {
			type: "textArea"
			, inputType: "text"
			, hint: "Max 500 characters"
			, max: 500
			, placeholder: _("BadSidePlaceholder")
			, rows: 3
			, validator: validators.string
		}
	}
	, improvement: {
		label: _("Improvement")
		, table: {
			align: "left"
		}
		, form: {
			type: "textArea"
			, inputType: "text"
			, hint: "Max 500 characters"
			, max: 500
			, placeholder: _("ImprovementPlaceholder")
			, rows: 3
			, validator: validators.string
		}
	}
	, highOrderAwakening: {
		label: _("HighOrderAwakening")
		, table: {
			align: "left"
		}
		, form: {
			type: "textArea"
			, inputType: "text"
			, hint: "Max 500 characters"
			, max: 500
			, placeholder: _("HighOrderAwakeningPlaceholder")
			, rows: 4
			, required: true
			, validator: validators.string
		}
	}
};

export default class Review {

	constructor(rawValues) {
		this._rawValues = rawValues;
		this._works = rawValues.works.map(w => {
			return new Work(w);
		});
		// TODO
		this._comments = null;
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get date() { return this._rawValues.date; }
	get highOrderAwakening() { return this._rawValues.highOrderAwakening; }
	get works() { return this._works; }
	get comments() { return this._comments; }
	get author() { return this._rawValues.author.username; }

	static createFormSchema(fieldSet) {
		if (!isArray(fieldSet)) {
			return Object.keys(fieldSet).map(key => {
				return {
					legend : _(key)
					, fields: fieldSet[key].map(f => { 
						if ( _fields[f] === undefined ) {
							throw new Error(`Missing the definition about "${f}" in filed at Task class!`);
						} else if ( _fields[f].form === undefined ) {
							throw new Error(`Missing the definition about "${f}.form" in filed at Task class!`);
						}
						let field = cloneDeep(_fields[f]);
						if (field.form.label === undefined) {
							field.form.label = field.label;
						}
						if (field.form.model === undefined) {
							field.form.model = f;
						}
						return field.form; 
					})
				};
			});
		} else {
			return fieldSet.map(f => {
				if ( _fields[f] === undefined ) {
					throw new Error(`Missing the definition about "${f}" in filed at Task class!`);
				} else if ( _fields[f].form === undefined ) {
					throw new Error(`Missing the definition about "${f}.form" in filed at Task class!`);
				}
				let field = cloneDeep(_fields[f]);
				if (field.form.label === undefined) {
					field.form.label = field.label;
				}
				if (field.form.model === undefined) {
					field.form.model = f;
				}
				return field.form; 
			});
		}
	}

}
