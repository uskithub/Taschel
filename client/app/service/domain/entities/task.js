import Vue from "vue";
import moment from "moment";
import { cloneDeep, isArray, isNil } from "lodash";
import { validators } from "vue-form-generator";


import { taskTypes, taskProperties } from "service/constants";

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
	, type: {
		label: _("TaskTypes")
		, table: {
			values: taskTypes
			, formatter(value, model) {
				let type = find(taskTypes, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "select"
			, required: true
			, values: taskTypes
		}
	}
	, properties: {
		label: _("TaskProperties")
		, table: {
			values: taskProperties
			, formatter(value, model) {
				// If you don't implement formatter, table.vue displays values of the array.
				return "";
			}
			, labels(value, model, col) {
				if (value == null || value.length === 0) return [];
				return value.reduce((arr, property) => {
					let tag = col.values.find(tag => tag.id === property);
					if (tag) {
						arr.push({
							className: "tag outline"
							, caption: tag.name
						});
					}
					return arr;
				}, []);
			}
		}
		, form: {
			type: "tagsInput"
			, required: true
			, values: taskProperties
			, default: []
			, set(rawValues, newValue) {
				rawValues.type = Task.decideTypeByProperties(newValue);
				rawValues.properties.splice(0);
				rawValues.properties.push(...newValue);
			}
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
					if (field.required && (isNil(value) || value === "")) {
						return [ _("DeadlineRequired") ];
					}
					return [];
				}
			]
		}
	}
	, schedule: {
		label: _("Schedule")
		, table: {}
		, form: {
			type: "myDateTimePicker"
			, placeholder: _("Schedule")
			, format: "YYYY-MM-DD"
			, dateTimePickerOptions: {
				format: "YYYY-MM-DD"
				, showClear: true
			}
			, validator: [
				// validators.date
				(value, field, entity) => {
					if (field.required && (isNil(value) || value === "")) {
						return [ _("ScheduleRequired") ];
					}
					return [];
				}
			]
		}
	}
	, manhour: {
		label: _("ManHour")
		, table: {}
		, form: {
			type: "rangeSlider"
			, min: 0
			, max: 90
			, default: 1
			, validator: [
				validators.integer
				, (value, field, entity) => {
					if (field.required && value === 0) {
						return [ _("ManhourRequired") ];
					}
					return [];
				}
			]
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
			align: "center"
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

export default class Task {

	/**
	 * projectsを渡すと、rootを設定する。
	 * 
	 * @param {*} rawValues 
	 * @param {*} projects 
	 */
	constructor(rawValues, projects) {
		this._rawValues = rawValues;

		if (projects && projects.length > 0) {
			const _projects = projects.reduce((result, p) => {
				result[p.code] = p;
				return result;
			}, {});
			
			if (rawValues.root === "-1") {
				this._root = null;
			} else {
				this._root = _projects[rawValues.root];
			}
		} else {
			this._root = null;
		}

		this._tasks = rawValues.children.map(task => {
			return new Task(task, projects);
		});
	}

	get rawValues() {
		return cloneDeep(this._rawValues);
	}

	get code() { return this._rawValues.code; }

	get type() { return this._rawValues.type; }

	get properties() { return this._rawValues.properties; }
	set properties(properties) { return this._rawValues.properties = properties; }

	get shortname() { return this._rawValues.shortname; }
	set shortname(shortname) { this._rawValues.shortname = shortname; }

	get name() { return this._rawValues.name; }
	set name(name) { this._rawValues.name = name; }

	get purpose() { return this._rawValues.purpose; }
	set purpose(purpose) { this._rawValues.purpose = purpose; }

	get goal() { return this._rawValues.goal; }
	set goal(goal) { this._rawValues.goal = goal; }

	get deadline() { return this._rawValues.deadline; }
	get manhour() { return this._rawValues.manhour; }
	get schedule() { return this._rawValues.schedule; }
	get dependencies() { return this._rawValues.dependencies; }
	get subscequences() { return this._rawValues.subscequences; }

	get root() { return this._root; }
	get parent() { return this._rawValues.parent; }

	get author() { return this._rawValues.author.username; }

	get tasks() { return this._tasks; }

	get lastCommunication() { return this._rawValues.lastCommunication; }

	// adding the task
	addChild(task) {
		this._tasks.push(task);
		this._rawValues.children.push(task.rawValues);
	}

	// return new child Task
	childTaskFactory(options) {
		let child = Object.assign({
			purpose: `${this.goal} にするため`
			, root: this.root
			, parent: this.code
			, children: []
		}, options);

		console.log("type?", this.type);

		if (this.type === "project" || this.type === "subproject") {
			child.type = "milestone";
		} else if (this.type === "milestone") {
			child.type = "requirement";
		} else if (this.type === "requirement" || this.type === "issue") {
			child.type = "way";
		} else if (this.type === "way") {
			child.type = "step";
		} else {
			child.type =  "todo";
		}

		return new Task(child, (this.root ? [this.root] : null));
	}

	static createTableSchema(fieldSet) {
		return fieldSet.map(f => {
			if ( _fields[f] === undefined ) {
				throw new Error(`Missing the definition about "${f}" in filed at Task class!`);
			} else if ( _fields[f].table === undefined ) {
				throw new Error(`Missing the definition about "${f}.table" in filed at Task class!`);
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

	/**
	 * 設定されているpropertiesで、typeが決定する
	 * 
	 * - propertiesに subproject がある → typeは subproject
	 * - propertiesに milestone がある → typeは milestone
	 * - propertiesに objective がある → typeは milestone
	 * - propertiesに exitcriteria がある → typeは requirement
	 * - propertiesに keyresult がある → typeは requirement
	 * 
	 * - typeが subproject
	 * 		- milestoneとの併用はOK
	 *	 	- keyresultになることはあってもobjectiveになることはない
	 *		- 子のdefaultは milestone
	 * 
	 */
	static decideTypeByProperties(properties) {

		if (properties.includes("subproject")) {
			return "subproject";
		} else if (properties.includes("milestone") || properties.includes("objective")) {
			return "milestone";
		} else if (properties.includes("exitcriteria") || properties.includes("keyresult")) {
			return "requirement";
		} else if (properties.includes("issue")) {
			return "issue";
		} else if (properties.includes("way")) {
			return "way";
		}

		return "todo";
	}

	/**
	 * propertyに対応してfieldを、fieldsになければ追加
	 * ある場合には必須項目化
	 * 
	 * @param {*} fields 
	 * @param {*} properties 
	 */
	static dynamicSchema(rawValues) {
		let fieldSet = { 
			type: { required: true }
			, name: { required: true }
			, purpose: { required: true }
			, goal: { required: true }
			, description: { required: false }
			, deadline: { required: false } 
			, manhour: { required: false } 
			, schedule: { required: false }
		};
		
		switch (rawValues.type) {
		case "subproject":
			fieldSet.deadline.required = true;
			break;
		case "milestone":
			fieldSet.deadline.required = true;
			fieldSet.manhour.readonly = true;
			break;
		case "requirement":
			break;
		case "issue":
			fieldSet.deadline.required = true;
			break;
		case "way":
			break;
		case "step":
			fieldSet.manhour.readonly = true;
			break;
		case "todo":
			fieldSet.deadline.required = true;
			fieldSet.manhour.required = true;
			break;
		default:
			break;
		}

		return Object.keys(fieldSet).map(f => {
			if ( _fields[f] === undefined ) {
				throw new Error(`Missing the definition about "${f}" in filed at Task class!`);
			} else if ( _fields[f].form === undefined ) {
				throw new Error(`Missing the definition about "${f}.form" in filed at Task class!`);
			}
			let field = cloneDeep(_fields[f]);
			field.form = Object.assign(field.form, fieldSet[f]);
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
