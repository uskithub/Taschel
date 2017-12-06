import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../tasks/types";
import { validators } from "vue-form-generator";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id : "gant"
	, title: _("Gant")
	, projectTable: {
		multiSelect : true
		, columns : [
			{
				title: _("ID"),
				field: "code",
				align: "left",
				formatter(value, model) {
					return model ? model.code : "";
				}
			}
			, {
				title: _("Type"),
				field: "type",
				formatter(value) {
					let type = find(taskTypes, (type) => type.id == value);
					return type ? type.name : value;
				}
			}
			, {
				title: _("Name"),
				field: "name"
			}
			, {
				title: _("Purpose"),
				field: "purpose"
			}
			, {
				title: _("Goal"),
				field: "goal"
			}
			, {
				title: _("Status"),
				field: "status",
				formatter(value, model, col) {
					return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
				},
				align: "center"
			}
			, {
				title: _("LastCommunication"),
				field: "lastCommunication",
				formatter(value) {
					return moment(value).fromNow();
				}
			}
		]
		, rowClasses : function (model) {
			return {
				inactive: !model.status
			};
		}
	}
	, form : {
		fields : [
			{
				type: "text",
				label: _("ID"),
				model: "code",
				readonly: true,
				disabled: true,
				multi: false,
				get(model) {
					if (model.code)
						return model.code;
					else
						return _("※自動採番");
				}
			}
			, {
				type: "select",
				label: _("TaskType"),
				model: "type",
				required: true,
				values: taskTypes,
				default: "step",
				validator: validators.required
			}
			, {
				type: "text",
				label: _("名称"),
				model: "name",
				featured: true,
				required: true,
				placeholder: _("タスクの名称（何をするかが連想できる様に）"),
				validator: validators.string
			}
			, {
				type: "text",
				label: _("目的"),
                model: "purpose",
                placeholder: _("なぜそのタスクをするのか"),
				featured: false,
				required: true,
				validator: validators.string
			}
			, {
				type: "text",
				label: _("ゴール"),
				model: "goal",
				placeholder: _("どういった状態になったら嬉しいか"),
				validator: validators.string
			}
			, {
				type: "label",
				label: _("LastCommunication"),
				model: "lastCommunication",
				get(model) { return model && model.lastCommunication ? moment(model.lastCommunication).fromNow() : "-"; }
			}
			, {
				type: "switch",
				label: _("Status"),
				model: "status",
				multi: true,
				default: 1,
				textOn: _("Active"),
				textOff: _("Inactive"),
				valueOn: 1,
				valueOff: 0
			}
		]
	}
	, options : {
		searchable: true,

		enableNewButton: true,
		enabledSaveButton: true,
		enableDeleteButton: true,
		enableCloneButton: false,
		enableBreakdownButton: true,

		validateAfterLoad: false, // Validate after load a model
		validateAfterChanged: false, // Validate after every changes on the model
		validateBeforeSave: true // Validate before save a model
	}
	, events : {
		onSelect: null,
		onNewItem: null,
		onCloneItem: null,
		onSaveItem: null,
		onDeleteItem: null,
		onChangeItem: null,
		onValidated(model, errors, schema) {
			if (errors.length > 0)
				console.warn("Validation error in page! Errors:", errors, ", Model:", model);
		}
	}
	, resources: {
        addCaption: _("追加／更新／削除"),
		saveCaption: _("Save"),
		cloneCaption: _("Clone"),
		breakdownCaption: _("Breakdown"),
		deleteCaption: _("Delete")
	}
};