import Vue from "vue";
import moment from "moment";
import { groupTypes } from "../common/constants/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id: "kanban"
	, title: _("Kanban (by KanbanPage)")
	, projectSelector: generate(areaTypes.form, ["project"])
	, popupForm : {
		title : ""
		, form: {
			fields: [
				{
					type: "select"
					, label: _("GroupType")
					, model: "type"
					, readonly: true
					, disabled: true
					, values: groupTypes
					, default: "kanban"
				}
				, {
					type: "input"
					, inputType: "text"
					, label: _("Name")
					, model: "name"
					, featured: true
					, required: true
					, placeholder: _("タスクの名称（何をするかが連想できる様に）")
					, validator: validators.string
				}
				, {
					type: "input"
					, inputType: "text"
					, label: _("Purpose")
					, model: "purpose"
					, placeholder: _("なぜそのタスクをするのか")
					, featured: false
					, required: true
					, validator: validators.string
				}
			]
		}
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
	, descriptions : [
		"project毎のカンバンを表示します"
		, "デフォルトのカバン（TODO/In Progress/Done）はProjectPageにてProjectを新規作成した際に作成されます"
		, "openされているmilestoneは未分類のタスクとして自動でカンバンに表示されます"
		, "typeがrequirement、wayあるいはstepのタスクが表示されます"
		, "unclassifiedグループやmilestone間でタスクを移動してもサーバに保存はされず、次回の表示時に変更はクリアされます"
	]
};