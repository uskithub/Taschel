import Vue from "vue";
import moment from "moment";
import { cloneDeep, isArray } from "lodash";
import { validators } from "vue-form-generator";

const _ = Vue.prototype._;

const _fields = {
	goal: {
		label: _("Goal")
		, table: {
			align: "left"
		}
		, form: {
			type: "input"
			, inputType: "text"
			, required: false
			, placeholder: _("TaskGoalPlaceholder")
			, validator: validators.string
		}
	}
	, actualStart: {
		label: _("Start")
		, table: {
			align: "left"
		}
		, form: {
			type: "myDateTimePicker"
			, format: "HH:mm"
			, closeRequired: true
			, dateTimePickerOptions: {
				format: "HH:mm"
				, stepping: 5
			}
			, finalize: (model, value, field) => {
				if (value) {
					const hhmm = value.split(":");
					return moment(model.start).hour(hhmm[0]).minute(hhmm[1]);
				} else {
					return value;
				}
			}
			, validator: validators.date
		}
	}
	, actualEnd: {
		label: _("End")
		, table: {
			align: "left"
		}
		, form: {
			type: "myDateTimePicker"
			, format: "HH:mm"
			, closeRequired: true
			, dateTimePickerOptions: {
				format: "HH:mm"
				, stepping: 5
			}
			, finalize: (model, value, field) => {
				if (value) {
					const hhmm = value.split(":");
					return moment(model.start).hour(hhmm[0]).minute(hhmm[1]);
				} else {
					return value;
				}
			}
			, validator: validators.date
		}
	}
	, description: {
		label: _("Description")
		, table: {
			align: "left"
		}
		, form: {
			type: "textArea"
			, inputType: "text"
			, hint: "Max 1000 characters"
			, max: 1000
			, placeholder: _("DescriptionPlaceholder")
			, rows: 5
			, closeRequired: true
			, validator: validators.string
		}
	}
};

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

	static finalize(model) {
		// TODO: v1から移植
	}
}
