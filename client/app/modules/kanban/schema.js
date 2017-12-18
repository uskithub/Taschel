import Vue from "vue";
import moment from "moment";
import { groupTypes } from "../../common/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {

	id: "kanban"
	, title: _("Kanban")
	, projectSelector: generate(
		areaTypes.form
		, ["project"]
	)
	, form: {
		fields: [
			{
				type: "select",
				label: _("GroupType"),
				model: "type",
				readonly: true,
				disabled: true,
				values: groupTypes,
				default: "kanban"
			}
			, {
				type: "text",
				label: _("Name"),
				model: "name",
				featured: true,
				required: true,
				placeholder: _("タスクの名称（何をするかが連想できる様に）"),
				validator: validators.string
			}
			, {
				type: "text",
				label: _("Purpose"),
				model: "purpose",
				placeholder: _("なぜそのタスクをするのか"),
				featured: false,
				required: true,
				validator: validators.string
			}
		]
	}
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