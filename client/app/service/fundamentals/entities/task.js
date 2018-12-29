import Vue from "vue";
import moment from "moment";
import { cloneDeep, isObject, isArray, isNil } from "lodash";
import { validators } from "vue-form-generator";

import { taskProperties } from "../../constants";

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
					if (entity.type === "milestone" && (isNil(value) || value === "")) {
						return [ _("MilestoneRequiresDeadline") ];
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
					if (entity.type === "milestone" && (isNil(value) || value === "")) {
						return [ _("MilestoneRequiresSchedule") ];
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
			, default: 1
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

		if (this.type === "subproject") {
			child.properties = [ "milestone" ];
		} else if (this.type === "milestone" && this.properties.includes("objective")) {
			child.properties = [ "keyresult" ];
		} else if (this.type === "milestone") {
			child.properties = [ "exitcriteria" ];
		} else if (this.type === "requirement") {
			child.properties = [ "way" ];
		} else if (this.type === "issue") {
			child.properties = [ "way" ];
		} else if (this.type === "way") {
			child.properties = [ "step" ];
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
	static dynamicSchema(fields, rawValues) {

		if ((rawValues.type && rawValues.type === "milestone") 
			|| (rawValues.properties && rawValues.properties.includes("milestone"))) {
			if (fields.find(f => f.model === "deadline") === undefined) {
				let f = Task.createFormSchema(["deadline"]).pop();
				f.required = true;
				fields.push(f);
			}
		} else {
			if (fields.find(f => f.model === "schedule") === undefined) {
				let f = Task.createFormSchema(["schedule"]).pop();
				fields.push(f);
			}
			if (fields.find(f => f.model === "timeframe") === undefined) {
				let f = Task.createFormSchema(["timeframe"]).pop();
				fields.push(f);
			}
		}

		return fields;
	}
}
