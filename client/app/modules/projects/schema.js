import Vue from "vue";
import moment from "moment";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id: "projects"
	, title: _("Projects (by ListPage)")
	, table: {
		multiSelect: true
		, columns: generate(
			areaTypes.table
			, [ "code", "name", "purpose", "goal", "status", "lastCommunication"]
		)
		, rowClasses: function(model) {
			return {
				inactive: !model.status
			};
		}
	}
	, form: generate(
		areaTypes.form
		, ["code", "type", "name", "purpose", "goal"]
	)
	, options: {
		searchable: true

		, isNewButtonEnable: true
		, isSaveButtonEnable: true
		, isCloseButtonEnable: true
		, isBreakdownButtonEnable: true
		, isCloneButtonEnable: false
		, isDeleteButtonEnable: true

		, validateAfterLoad: false // Validate after load a model
		, validateAfterChanged: false // Validate after every changes on the model
		, validateBeforeSave: true // Validate before save a model
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