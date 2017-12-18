import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../../common/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {

	id: "tasks"
	, title: _("Tasks (by TaskPage)")
	, table: {
		multiSelect: true
		, columns: generate(
			areaTypes.table
			, [ "code", "name", "purpose", "goal", "asignee_code", "author", "status", "lastCommunication"]
		)
		, rowClasses: function(model) {
			return {
				inactive: !model.status
			};
		}

	}
	, projectSelector: generate(
		areaTypes.form
		, ["project"]
	)
	, form : generate(
		areaTypes.form
		, ["code", "root_code", "type","name", "purpose", "goal", "asignee_code", "lastCommunication", "status"]
	)
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