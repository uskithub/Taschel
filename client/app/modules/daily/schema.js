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
		timezone : "local"
		, eventColor: "#FF895D"
		, eventTextColor: "#6C567B"
		, closedEventColor : {
			color: "#C5F0A4"
			, textColor: "#226B80"
		}
		, googleCalendarApiKey: "AIzaSyBs9rLYkbTc8gf05hOsZ4iOWLBj8Rptn1k"
		, droppable: true
		, editable: true
		, selectable: true
		, defaultView: "agendaWeek"
		// , events: {
		// 	// 公開設定にすればできる
        //     googleCalendarId: "yusuke.saito@jibunstyle.com"
        // }
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
		, aspectRatio: 1.5
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
				, snapDuration: "00:15:00"
			}
			, day: {
				// options apply to basicDay and agendaDay views
			}
		}
	}
	, popupForm : {
		title : ""
		, form: {
			fields: [
				{
					type: "input"
					, inputType: "text"
					, label: _("Name")
					, model: "name"
					, featured: true
					, placeholder: _("work_name")
					, validator: validators.string
				}
				, {
					type: "input"
					, inputType: "text"
					, label: _("Goal")
					, model: "goal"
					, placeholder: _("work_goal")
					, featured: false
					, validator: validators.string
				}
				, { 
					type: "dateTimePicker"
					, label: _("Start")
					, model: "actualStart"
					, placeholder: _("Start_time")
					, format: "HH:mm"
					, closeRequired: true
					, dateTimePickerOptions: {
						format: "HH:mm"
						, stepping: 15
					}
					, finalize: (model, value, field) => {
						if (value) {
							const hhmm = value.split(":");
							return moment(model.start).hour(hhmm[0]).minute(hhmm[1]);
						} else {
							return value;
						}
					}
					, validator: validators.date
				}
				, { 
					type: "dateTimePicker"
					, label: _("End")
					, model: "actualEnd"
					, placeholder: _("End time")
					, format: "HH:mm"
					, closeRequired: true
					, dateTimePickerOptions: {
						format: "HH:mm"
						, stepping: 15
					}
					, finalize: (model, value, field) => {
						if (value) {
							const hhmm = value.split(":");
							return moment(model.start).hour(hhmm[0]).minute(hhmm[1]);
						} else {
							return value;
						}
					}
					, validator: validators.date
				}
				, { 
					type: "textArea"
					, label: _("description")
					, model: "description"
					, hint: "Max 500 characters"
					, max: 500
					, placeholder: "User's biography"
					, rows: 4
					, closeRequired: true
					, validator: validators.string
				}
			]
		}
		, options: {
			searchable: true
			
			, isSaveButtonEnable: true
			, isCloseButtonEnable: true
			, isDeleteButtonEnable: true
			, isCancelButtonEnable: true
	
			, validateAfterLoad: false // Validate after load a model
			, validateAfterChanged: false // Validate after every changes on the model
			, validateBeforeSave: true // Validate before save a model
		}
		, resources: {
			saveCaption: _("Save")
			, closeCaption: _("Close")
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
		"Weeklyで今週行うタスクに割り当てたタスクが左に表示されます"
		, "タスク一覧からDrag&Dropで日毎のスケジュールを行います"
		, "日毎の割当てはTaskに対してWorkと呼びます"
		, "Workはおしりを引っ張ることで予定割当て時刻の延長ができます"
		, "Openされているタスクはオレンジ、Closeするとグリーンで表示されます"
		, "Close時、実際の開始／終了時間、実施内容の入力は必須です"
	]
};