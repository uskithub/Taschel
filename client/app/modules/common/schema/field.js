import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../../common/constants/types";
import { validators } from "vue-form-generator";
import { cloneDeep } from "lodash";

let _ = Vue.prototype._;

const fields = {
	code: {
		label: _("ID")
		, model: "code"
		, table: {
			align: "left"
			, formatter(value, model) {
				return model ? model.code : "";
			}
		}
		, form: {
			type: "text"
			, readonly: true
			, disabled: true
			, multi: false
			, get(model) {
				if (model.code)
					return model.code;
				else
					return _("※自動採番");
			}
		}
	}
	, root: {
		label: _("Projects") 
		, model: "root"
		, table: {}
		, form: {
			type: "select"
			, model: "root_code"
			, values: []
		}
	}
	, type: {
		label: _("TaskType")
		, model: "type"
		, table: {
			formatter(value) {
				let type = find(taskTypes, (type) => type.id == value);
				return type ? type.name : value;
			}
		}
		, form: {
			type: "select"
			, required: true
			, values: taskTypes
			, default: "step"
			, validator: validators.required
		}
	}
	, name: {
		label: _("Name")
		, model: "name"
		, table: {}
		, form: {
			type: "text"
			, featured: true
			, required: true
			, placeholder: _("タスクの名称（何をするかが連想できる様に）")
			, validator: validators.string
		}
	}
	, purpose: {
		label: _("Purpose")
		, model: "purpose"
		, table: {}
		, form: {
			type: "text"
			, placeholder: _("なぜそのタスクをするのか")
			, featured: false
			, required: true
			, validator: validators.string
		}
	}
	, goal: {
		label: _("Goal")
		, model: "goal"
		, table: {}
		, form: {
			type: "text"
			, placeholder: _("どういった状態になったら嬉しいか")
			, validator: validators.string
		}
	}
	, asignee : {
		label: _("Asignee")
		, model: "asignee"
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
	, author : {
		label: _("Author")
		, model: "author"
		, table: {
			formatter(value, model, col) {
				return model.author.username;
			}
			, align: "center"
		}
		, form: {}
	}
	, lastCommunication: {
		label: _("LastCommunication")
		, model: "lastCommunication"
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
		, model: "status"
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
	// proejctSeelctor向け
	, project: {
		label: _("Project")
		, model: "code"
		, table: {}
		, form: {
			type: "select"
			, values: [] // DefaultTaskPage.vueにて後から設定している
		}
	}
};

export const areaTypes = {
	form : "form"
	, table : "table"
};

export const generate = (areaType, fieldSet) => {
	if (areaType == areaTypes.form) {
		return {
			fields: fieldSet.map(f => { 
				let field = cloneDeep(fields[f]);
				if (field.form.label == undefined) {
					field.form.label = field.label;
				}
				if (field.form.model == undefined) {
					field.form.model = field.model;
				}
				return field.form; 
			})
		};
	} else {
		return  fieldSet.map(f => { 
			let field = cloneDeep(fields[f]);
			if (field.table.title == undefined) {
				field.table.title = field.label;
			}
			if (field.table.field == undefined) {
				field.table.field = field.model;
			}
			return field.table; 
		});
	}
};

