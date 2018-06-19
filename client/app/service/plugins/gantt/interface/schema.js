import Vue from "vue";


const _ = Vue.prototype._;

export default {
	fullCalendar : {
		timezone : "local"
		// , themeSystem : "bootstrap3"
		, eventColor: "#FF895D"
		, eventTextColor: "#6C567B"
		, closedEventColor : {
			color: "#C5F0A4"
			, textColor: "#226B80"
		}
		, googleCalendarEventColor : {
			color: "#808080"
			, textColor: "#ffffff"
		}
		, googleCalendarApiKey: "AIzaSyBs9rLYkbTc8gf05hOsZ4iOWLBj8Rptn1k"
		, droppable: true
		, editable: true
		, selectable: true
		, defaultView: "timelineYear"
		// , events: {
		// 	// 公開設定にすればできる
		//     googleCalendarId: "yusuke.saito@jibunstyle.com"
		// }
		, resourceGroupField: "building"
		, header : {
			left:   "today prev,next"
			, center: "title"
			, right:  "timelineThreeMonths,timelineYear"
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
			, timelineThreeMonths: {
				type: "timeline"
				, duration: { months: 3 }
			}
			, month: { // name of view
				titleFormat: "YYYY, MM, DD"
				// other view-specific options here
			}
			// , week: {
			// 	// options apply to basicWeek and agendaWeek views
			// 	allDaySlot : true
			// 	, allDayText: _("Review")
			// 	, scrollTime : "8:00"
			// 	, minTime : "6:00"
			// 	, maxTime : "22:00"
			// 	, timeFormat: "HH:mm"
			// 	, snapDuration: "00:15:00"
			// }
			, day: {
				// options apply to basicDay and agendaDay views
			}
		}
	}
};
