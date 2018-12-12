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
			, requiredInClosing : true
			, dateTimePickerOptions: {
				format: "HH:mm"
				, stepping: 5
			}
			, get(rawValues) {
				if (rawValues.actualStart === undefined) {
					return moment(rawValues.start).format("HH:mm");
				} else {
					return moment(rawValues.actualStart).format("HH:mm");
				}
			}
			, set(rawValues, newValue) {
				if (newValue) {
					const hhmm = newValue.split(":");
					rawValues.actualStart = moment(rawValues.start).hour(hhmm[0]).minute(hhmm[1]);
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
			, requiredInClosing: true
			, dateTimePickerOptions: {
				format: "HH:mm"
				, stepping: 5
			}
			, get(rawValues) {
				if (rawValues.actualEnd === undefined) {
					return moment().format("HH:mm");
				} else {
					return moment(rawValues.actualEnd).format("HH:mm");
				}
			}
			, set(rawValues, newValue) {
				if (newValue) {
					const hhmm = newValue.split(":");
					rawValues.actualEnd = moment(rawValues.end).hour(hhmm[0]).minute(hhmm[1]);
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
			, requiredInClosing: true
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
		this._comments = null;
	}

	get rawValues() { return cloneDeep(this._rawValues); }
	get code() { return this._rawValues.code; }
	get title() { return this._rawValues.title; }
	get start() { return this._rawValues.start; }
	get end() { return this._rawValues.end; }
	get purpose() { return this._rawValues.purpose; }
	get status() { return this._rawValues.status; }
	get goal() { return this._rawValues.goal; }
	get actualStart() { return this._rawValues.actualStart; }
	get actualEnd() { return this._rawValues.actualEnd; }
	get description() { return this._rawValues.description; }
	get goodSide() { return this._rawValues.goodSide; }
	get badSide() { return this._rawValues.badSide; }
	get improvement() { return this._rawValues.improvement; }
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

	// TODO: get/setを使えば要らないかも。actualStart/Endでは要らなかった
	static finalize(rawValues) {
		let _rawValues = cloneDeep(rawValues);
		Object.keys(_fields).map(key => {
			const f = _fields[key].form;
			if (f && f.finalize) {
				_rawValues[key] = f.finalize(_rawValues, _rawValues[key], f);
			}
		});
		return _rawValues;
	}
}
