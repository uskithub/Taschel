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
	, popupForm : {
		form : (() => {
			let _form = generate(
				areaTypes.form
				, ["code", "type", "name", "purpose", "goal"]
			);
			return { 
				fields : _form.fields.map( f => {
					if (f.model == "type") {
						f.type = "input";
						f.inputType = "text";
						f.default = "project";
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
			, isCloseButtonEnable: true
			, isBreakdownButtonEnable: false
			, isCloneButtonEnable: true
			, isDeleteButtonEnable: true
			, isCancelButtonEnable: true
	
			, validateAfterLoad: false // Validate after load a model
			, validateAfterChanged: false // Validate after every changes on the model
			, validateBeforeSave: true // Validate before save a model
		}
		, resources: {
			saveCaption: _("Save")
			, closeCaption: _("Close")
			, breakdownCaption: _("Breakdown")
			, cloneCaption: _("Clone")
			, deleteCaption: _("Delete")
			, cancelCaption: _("Cancel")
		}
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
};