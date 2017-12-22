import Vue from "vue";
import moment from "moment";
import { groupTypes } from "../common/constants/types";
import { validators } from "vue-form-generator";
import { areaTypes, generate } from "../common/schema/field";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {
	id: "daily"
    , title: _("Daily")
    , fullCalendar : {
		droppable: true
		, defaultView: "agendaWeek"
		, header : {
			left:   "title"
			, center: ""
			, right:  "prev, next"
		}
		, businessHours: {
			// days of week. an array of zero-based day of week integers (0=Sunday)
			dow: [ 1, 2, 3, 4, 5 ] // Monday - Thursday
			, start: "9:00"
			, end: "18:00"
		}
		// , dayNames : [_("Sunday"), _("Monday"), _("Tuesday"), _("Wednesday"), _("Thursday"), _("Friday"), _("Saturday")]
		, weekends: false
		, aspectRatio: 2
		, views: {
			basic: {
				// options apply to basicWeek and basicDay views
			}
			, agenda: {
				// options apply to agendaWeek and agendaDay views
				
			}
			, month: { // name of view
				titleFormat: "YYYY, MM, DD"
				// other view-specific options here
			}
			, week: {
				// options apply to basicWeek and agendaWeek views
				allDaySlot : false
				, scrollTime : "8:00"
				, minTime : "6:00"
				, maxTime : "22:00"
				, timeFormat: "HH:mm"	
			}
			, day: {
				// options apply to basicDay and agendaDay views
			}
		}
	}
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

		enableNewButton: false,
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