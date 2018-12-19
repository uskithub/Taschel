import Vue from "vue";
import Task from "./task";
import { cloneDeep, isObject, isArray } from "lodash";
import { validators } from "vue-form-generator";

import { projectTypes } from "../../constants";

const _ = Vue.prototype._;

const _fields = {
	code: {
		label: _("ID")
		, table: {
			align: "left"
			, formatter(value, entity) {
				return entity ? entity.code : "";
			}
		}
		, form: {
			type: "input"
			, inputType: "text"
			, readonly: true
			, disabled: true
			, multi: false
			, get(entity) {
				if (entity.code)
					return entity.code;
				else
					return _("AutomaticNumbering");
			}
		}
	}
	, projectType: {
		label: _("ProjectType")
		, table: {
			formatter(value) {
				let type = find(projectTypes, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "select"
			, required: true
			, values: projectTypes
			, default: projectTypes[1].id
			, readonly: true
			, disabled: true
			, validator: validators.required
		}
	}
	, name: {
		label: _("Name")
		, table: {
			align: "left"
		}
		, form: {
			type: "input"
			, inputType: "text"
			, featured: true
			, required: true
			, placeholder: _("TaskNamePlaceholder")
			, validator: validators.string
		}
	}
	, shortname: {
		label: _("ShortName")
		, table: {
			align: "center"
		}
		, form: {
			type: "input"
			, inputType: "text"
			, featured: true
			, required: true
			, placeholder: _("TaskShortNamePlaceholder")
			, validator: validators.string
		}
	}
	, purpose: {
		label: _("Purpose")
		, table: {
			align: "left"
		}
		, form: {
			type: "input"
			, inputType: "text"
			, placeholder: _("TaskPurposePlaceholder")
			, featured: false
			, required: true
			, validator: validators.string
		}
	}
	, goal: {
		label: _("Goal")
		, table: {
			align: "left"
		}
		, form: {
			type: "input"
			, inputType: "text"
			, required: true
			, placeholder: _("TaskGoalPlaceholder")
			, validator: validators.string
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
			, validator: validators.string
		}
	}
	, deadline: {
		label: _("Deadline")
		, table: {}
		, form: {
			type: "myDateTimePicker"
			, placeholder: _("Deadline")
			, format: "YYYY-MM-DD"
			, dateTimePickerOptions: {
				format: "YYYY-MM-DD"
				, showClear: true
			}
			, validator: [
				// validators.date
				(value, field, entity) => {
					if (entity.type == "milestone" && (isNil(value) || value === "")) {
						return [ _("MilestoneRequiresDeadline") ];
					}
					return [];
				}
			]
		}
	}
	, timeframe: {
		label: _("Timeframe")
		, table: {}
		, form: {
			type: "rangeSlider"
			, min: 0
			, max: 90
			, validator: validators.integer
		}
	}
	, closingComment: {
		label: _("ClosingComment")
		, table: {
			align: "left"
		}
		, form: {
			type: "textArea"
			, inputType: "text"
			, hint: "Max 1000 characters"
			, max: 1000
			, placeholder: _("ClosingCommentPlaceholder")
			, rows: 4
			, closeRequired: true
			, validator: validators.string
		}
	}
	, asignee : {
		label: _("Asignee")
		, table: {
			formatter(value, entity, col) {
				return (entity.asignee) ? entity.asignee.username : "-";
			}
			, align: "center"
		}
		, form: {
			model: "asignee_code"
			, type: "select"
			, values: []
		}
	}
	, assistants : {
		label: _("Assistants")
		, table: {
			formatter(value, entity, col) {
				return (entity.assistants) ? entity.assistants.username : "-";
			}
			, align: "center"
		}
		, form: {
			type: "tagsInput"
			, values: []
		}
	}
	, author : {
		label: _("Author")
		, table: {
			formatter(value, entity, col) {
				return entity.author.username;
			}
			, align: "center"
		}
		, form: {
			type: "select"
			, values: []
		}
	}
	, lastCommunication: {
		label: _("LastCommunication")
		, table: {
			formatter(value) {
				return moment(value).fromNow();
			}
		}
		, form: {
			type: "label"
			, get(entity) { return entity && entity.lastCommunication ? moment(entity.lastCommunication).fromNow() : "-"; }
		}
	}
};

// Taskのメソッドは引き継ぐこと
export default class Project {

	constructor(rawValues) {
		this._rawValues = rawValues;
		// TODO: new Task()にprojectsを渡せていないので、rootがない
		this._tasks = rawValues.children ? rawValues.children.map(t => new Task(t)) : [];
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

	get root() { return this._rawValues.root; }

	get description() { return this._rawValues.description; }
	set description(description) { return this._rawValues.description = description; }

	get status() { return this._rawValues.status; }

	get author() { return this._rawValues.author; }
	get tasks() { return this._tasks; }

	// adding the task
	addChild(task) {
		this._tasks.push(task);
		this._rawValues.children.push(task.rawValues);
	}

	updateDescendant(task) {
		const searchRecursively = (parent, child) => {
			const len = parent.tasks.length;
			for (let i=0; i<len; i++) {
				if (parent.tasks[i].code === child.code) {
					parent.tasks.splice(i, 1, child);
					return true;
				}
			}
			for (let i=0; i<len; i++) {
				if (searchRecursively(parent.tasks[i], child)) {
					return true;
				}
			}
			return false;
		};

		searchRecursively(this, task);
	}

	static createTableSchema(fieldSet) {
		return fieldSet.map(f => {
			if ( _fields[f] === undefined ) {
				throw new Error(`Missing the definition about "${f}" in filed at Project class!`);
			} else if ( _fields[f].table === undefined ) {
				throw new Error(`Missing the definition about "${f}.table" in filed at Project class!`);
			}
			let field = cloneDeep(_fields[f]);
			if (field.table.title === undefined) {
				field.table.title = field.label;
			}
			if (field.table.field === undefined) {
				field.table.field = f;
			}
			return field.table; 
		});
	}

	static createFormSchema(fieldSet) {
		if (!isArray(fieldSet)) {
			return {
				groups : Object.keys(fieldSet).map(key => {
					return {
						legend : _(key)
						, fields: fieldSet[key].map(f => { 
							if ( _fields[f] === undefined ) {
								throw new Error(`Missing the definition about "${f}" in filed at Project class!`);
							} else if ( _fields[f].form === undefined ) {
								throw new Error(`Missing the definition about "${f}.form" in filed at Project class!`);
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
				})
			};
		} else {
			return fieldSet.map(f => {
				if ( _fields[f] === undefined ) {
					throw new Error(`Missing the definition about "${f}" in filed at Project class!`);
				} else if ( _fields[f].form === undefined ) {
					throw new Error(`Missing the definition about "${f}.form" in filed at Project class!`);
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
