import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../../common/types";
import { validators } from "vue-form-generator";
import fieldGenerator from "../common/schema/form";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id : "mytasks"
	, title: _("My Tasks")
	, table: {
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
	, form : fieldGenerator(["code", "root_code", "type","name", "purpose", "goal", "lastCommunication", "status"])
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