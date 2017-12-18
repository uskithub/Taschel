import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../common/constants/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id : "gant"
	, title: _("Gant")
	, projectSelector: generate(
		areaTypes.form
		, ["project"]
	)
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