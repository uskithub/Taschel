import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../../common/types";
import { validators } from "vue-form-generator";
import fieldGenerator from "../common/schema/form";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {

	id: "tasks"
	, title: _("Tasks")
	, table: {
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
		]
		, rowClasses: function(model) {
			return {
				inactive: !model.status
			};
		}

	}
	, projectSelector: {
		fields: [
			{
				type: "select",
				label: _("Project"),
				model: "code",
				values: [] // DefaultTaskPage.vueにて後から設定している
			},	
		]
	}
	, form : fieldGenerator(["code", "root_code", "type","name", "purpose", "goal", "asignee_code", "lastCommunication", "status"])
	, options: {
		searchable: true,


		enableNewButton: true,
		enabledSaveButton: true,
		enableDeleteButton: true,
		enableCloneButton: false,

		validateAfterLoad: false, // Validate after load a model
		validateAfterChanged: false, // Validate after every changes on the model
		validateBeforeSave: true // Validate before save a model
	}
	, events: {
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
		deleteCaption: _("Delete")
	}

};