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
	, projectSelector: generate(areaTypes.form, ["project"])
	, popupForm : {
		title : ""
		, form : (() => {
			let _form = generate(
				areaTypes.form
				, ["code", "root", "type","name", "purpose", "goal", "asignee", "lastCommunication", "status"]
			);
			return { 
				fields : _form.fields.map(f => {
					if (f.model == "root_code") {
						f.readonly = true;
						f.disabled = true;
					}
					return f;
				})
			};
		})()
		, options : {
			searchable: true
	
			, isAddButtonEnable: true
			, isSaveButtonEnable: true
			, isCloseButtonEnable: false
			, isBreakdownButtonEnable: false
			, isCloneButtonEnable: false
			, isDeleteButtonEnable: true
			, isCancelButtonEnable: true
	
			, validateAfterLoad: false // Validate after load a model
			, validateAfterChanged: false // Validate after every changes on the model
			, validateBeforeSave: true // Validate before save a model
		}
		, resources: {
			saveCaption: _("Save")
			, cloneCaption: _("Clone")
			, breakdownCaption: _("Breakdown")
			, deleteCaption: _("Delete")
		}
	}
	, events : {
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
};