import Vue from "vue";
import moment from "moment";
import { groupTypes } from "../common/constants/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id: "weekly"
	, title: _("Weekly (by WeeklyPage)")
	, userSelector: generate(areaTypes.form, ["author"])
	, popupForm : {
		title : ""
		, form : generate(
			areaTypes.form
			, [ "root", "type", "name", "purpose", "goal"]
		)
		, options : {
			searchable: true
	
			, isAddButtonEnable: true
			, isSaveButtonEnable: true
			, isCloseButtonEnable: true
			, isBreakdownButtonEnable: true
			, isCloneButtonEnable: true
			, isDeleteButtonEnable: true
			, isCancelButtonEnable: true
	
			, validateAfterLoad: false // Validate after load a model
			, validateAfterChanged: false // Validate after every changes on the model
			, validateBeforeSave: true // Validate before save a model
		}
		, resources: {
			saveCaption: _("Save")
			, deleteCaption: _("Delete")
			, cancelCaption: _("Cancel")
		}
	}
	, options: {
		searchable: true,

		enableNewButton: false,
		enabledSaveButton: true,
		enableDeleteButton: true,
		enableCloneButton: false,

		validateAfterLoad: false, // Validate after load a model
		validateAfterChanged: false, // Validate after every changes on the model
		validateBeforeSave: true // Validate before save a model
	}
	, events: {
		onSelect: null
		, onNewItem: null
		, onCloneItem: null
		, onSaveItem: null
		, onDeleteItem: null
		, onChangeItem: null
		, onValidated(model, errors, schema) {
			if (errors.length > 0)
				console.warn("Validation error in page! Errors:", errors, ", Model:", model);
		}
	}
	, resources: {
		addCaption: _("Add")
	}
	, descriptions : [
		"今週行うタスクを「貢献度✕緊急度」のマトリクスで分類します"
		, "マトリクスに配置されたタスクは今週行うものとして、dailyページに表示されるようになります"
		, "authorまたはasigneeが自分で、typeが (requirement|way|step)でかつchildrenを持たないタスクのみ表示されます"
	]
};