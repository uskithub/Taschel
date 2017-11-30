import Vue from "vue";
import moment from "moment";
import { taskTypes } from "./types";
import { validators } from "vue-form-generator";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {

	id: "tasks"
	, title: _("Tasks")
	, projectTable: {
		multiSelect: true,
		columns: [
			{
				title: _("Name")
				, field: "name"
				, align: "left"
            }
		],

		rowClasses: function(model) {
			return {
				inactive: !model.status
			};
		}

	}
	, taskTable: {
		multiSelect: true
		, columns: [
			{
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
				title: _("Asignee"),
				field: "asignee",
				formatter(value, model, col) {
					return (model.asignee) ? model.asignee.username : "-";
				},
				align: "center"
			}
			, {
				title: _("Author"),
				field: "author",
				formatter(value, model, col) {
					return model.author.username;
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
		],

		rowClasses: function(model) {
			return {
				inactive: !model.status
			};
		}

	},

	form: {
		fields: [
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
			},
			{
				type: "text"
				, label: _("RootTask")
				, model: "root_code"
				, readonly: true
				, disabled: true
				, get(model) {
					if (model.root_code)
						return model.root_code;
					else
						return _("未設定");
				}
			},
			{
				type: "select",
				label: _("TaskType"),
				model: "type",
				required: true,
				values: taskTypes,
				default: "step",
				validator: validators.required
			},	
			{
				type: "text",
				label: _("名称"),
				model: "name",
				featured: true,
				required: true,
				placeholder: _("タスクの名称（何をするかが連想できる様に）"),
				validator: validators.string
			},
			{
				type: "text",
				label: _("目的"),
                model: "purpose",
                placeholder: _("なぜそのタスクをするのか"),
				featured: false,
				required: true,
				validator: validators.string
			},	
			{
				type: "text",
				label: _("ゴール"),
				model: "goal",
				placeholder: _("どういった状態になったら嬉しいか"),
				validator: validators.string
			},
			{
				type: "select",
				label: _("Asignee"),
				model: "asignee",
				values: [] // index.vueにて後から設定している
			},
			{
				type: "label",
				label: _("LastCommunication"),
				model: "lastCommunication",
				get(model) { return model && model.lastCommunication ? moment(model.lastCommunication).fromNow() : "-"; }
			},
			{
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
	},

	options: {
		searchable: true,


		enableNewButton: true,
		enabledSaveButton: true,
		enableDeleteButton: true,
		enableCloneButton: false,

		validateAfterLoad: false, // Validate after load a model
		validateAfterChanged: false, // Validate after every changes on the model
		validateBeforeSave: true // Validate before save a model
	},

	events: {
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
	},

	resources: {
        addCaption: _("追加／更新／削除"),
		saveCaption: _("Save"),
		cloneCaption: _("Clone"),
		deleteCaption: _("Delete")
	}

};