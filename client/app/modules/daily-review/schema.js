import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../common/constants/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id : "daily-review"
	, title: _("DailyReview")
	, projectSelector: generate(areaTypes.form, ["project"])
	, popupForm : {
		title : ""
		, form : {
			fields: [
				{ 
					type: "textArea"
					, label: _("Comment")
					, model: "comment"
					, hint: "Max 250 characters"
					, max: 250
					, placeholder: _("CommentPlaceholder")
					, rows: 4
					, required: true
					, validator: validators.string
				}
			]
		}
		, options : {
			isSaveButtonEnable: true
			, isCancelButtonEnable: true
	
			, validateAfterLoad: false // Validate after load a model
			, validateAfterChanged: false // Validate after every changes on the model
			, validateBeforeSave: true // Validate before save a model
		}
		, resources: {
			saveCaption: _("Save")
			, cancelCaption: _("Cancel")
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
	, descriptions : [
		"選択したプロジェクトの子タスクをツリー表示します"
		, "各タスクはdrag&dropで順序を入れ替えることができます"
		, "taskTypeがmilestoneの場合、deadlineの入力は必須です"
	]
};