import Vue from "vue";
import moment from "moment";
import constants from "../constants";
import { projectTypes, taskTypes, taskProperties, organizationType, roles } from "../constants";
import { validators } from "vue-form-generator";
import { cloneDeep, isObject, isNil, isArray } from "lodash";

const _ = Vue.prototype._;

const fields = {
	code: {
		label: _("ID")
		, table: {
			align: "left"
			, formatter(value, model) {
				return model ? model.code : "";
			}
		}
		, form: {
			type: "input"
			, inputType: "text"
			, readonly: true
			, disabled: true
			, multi: false
			, get(model) {
				if (model.code)
					return model.code;
				else
					return _("AutomaticNumbering");
			}
		}
	}
	, root: {
		label: _("Projects") 
		, table: {
			formatter(value, model, col) {
				return isObject(value) ? value.name : "-";
			}
		}
		, form: {
			type: "select"
			, model: "root_code"
			, values: []
		}
	}
	, projectType: {
		label: _("ProjectType")
		, table: {
			formatter(value) {
				let type = find(constants.projectTypes, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "select"
			, required: true
			, values: constants.projectTypes
			, default: constants.projectTypes[0].id
			, validator: validators.required
			//, validator: validators.required
		}
	}
	, type: {
		label: _("TaskType")
		, table: {
			formatter(value) {
				let type = find(taskTypes, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			// type: "select"
			// , required: true
			// , values: taskTypes
			// , default: "step"
			// , validator: validators.required
			type: "tagsInput"
			, required: true
			, values: taskTypes
			, default: "step"
			//, validator: validators.required
		}
	}
	, properties: {
		label: _("TaskProperties")
		, table: {
			formatter(value) {
				let type = find(taskProperties, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "tagsInput"
			, required: true
			, values: taskProperties
			, default: []
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
			formatter(value, model, col) {
				return isObject(value) ? value.shortname : "-";
			}
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
				(value, field, model) => {
					if (model.type == "milestone" && (isNil(value) || value === "")) {
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
			formatter(value, model, col) {
				return (model.asignee) ? model.asignee.username : "-";
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
			formatter(value, model, col) {
				return (model.assistants) ? model.assistants.username : "-";
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
			formatter(value, model, col) {
				return model.author.username;
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
			, get(model) { return model && model.lastCommunication ? moment(model.lastCommunication).fromNow() : "-"; }
		}
	}
	, status: {
		label: _("Status")
		, table: {
			formatter(value, model, col) {
				return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
			}
			, align: "center"
		}
		, form: {
			type: "switch"
			, multi: true
			, default: 1
			, textOn: _("Active")
			, textOff: _("Inactive")
			, valueOn: 1
			, valueOff: 0
		}
	}
	// proejctSelector向け
	, project: {
		label: _("Project")
		, table: {}
		, form: {
			type: "select"
			, values: [] // DefaultTaskPage.vueにて後から設定している
		}
	}
	, organizationName: {
		label: _("OrganizationName")
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
	, organizationType: {
		label: _("OrganizationType")
		, table: {
			formatter(value) {
				let type = find(organizationType, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "select"
			, required: true
			, values: organizationType
			, default: "normal"
			, validator: validators.required
		}
	}
	, role: {
		label: _("Role")
		, table: {
			formatter(value) {
				let type = find(roles, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "select"
			, required: true
			, values: roles
			, default: "member"
			, validator: validators.required
		}
	}
};

export const componentTypes = {
	form : "form"
	, table : "table"
};

export const generate = (componentType, fieldSet) => {
	if (componentType == componentTypes.form) {
		if (!isArray(fieldSet)) {
			return {
				groups : Object.keys(fieldSet).map(key => {
					return {
						legend : _(key)
						, fields: fieldSet[key].map(f => { 
							if ( fields[f] === undefined ) {
								throw new Error(`Missing the definition about "${f}" in filed at fieldGenerator!`);
							} else if ( fields[f].form === undefined ) {
								throw new Error(`Missing the definition about "${f}.form" in filed at fieldGenerator!`);
							}
							let field = cloneDeep(fields[f]);
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
			return {
				fields: fieldSet.map(f => {
					if ( fields[f] === undefined ) {
						throw new Error(`Missing the definition about "${f}" in filed at fieldGenerator!`);
					} else if ( fields[f].form === undefined ) {
						throw new Error(`Missing the definition about "${f}.form" in filed at fieldGenerator!`);
					}
					let field = cloneDeep(fields[f]);
					if (field.form.label === undefined) {
						field.form.label = field.label;
					}
					if (field.form.model === undefined) {
						field.form.model = f;
					}
					return field.form; 
				})
			};
		}
	} else {
		return fieldSet.map(f => {
			if ( fields[f] === undefined ) {
				throw new Error(`Missing the definition about "${f}" in filed at fieldGenerator!`);
			} else if ( fields[f].form === undefined ) {
				throw new Error(`Missing the definition about "${f}.table" in filed at fieldGenerator!`);
			}
			let field = cloneDeep(fields[f]);
			if (field.table.title === undefined) {
				field.table.title = field.label;
			}
			if (field.table.field === undefined) {
				field.table.field = f;
			}
			return field.table; 
		});
	}
};