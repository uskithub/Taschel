import Vue from "vue";


const _ = Vue.prototype._;

export default {
	form : { 
		fields : [ "type", "properties", "name", "purpose", "goal", "deadline"]
	}
	, data : {
		"rows": [
		  {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1334836925000
						, "to": 1334837045000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23"
						, "from": 1334837045000
						, "to": 1334837183000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1 просрочен"
						, "from": 1334923578000
						, "to": 1334929209000
						, "color": "#F9C4E1"
			  }
			  , {
						"desc": "Шаг 1"
						, "from": 1334837183000
						, "to": 1334923578000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23 просрочен"
						, "from": 1334964989000
						, "to": 1458903330000
						, "color": "#F9C4E1"
			  }
			  , {
						"desc": "Шаг 23"
						, "from": 1334929209000
						, "to": 1334964989000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1458903330000
						, "to": 1458903772000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23"
						, "from": 1458903772000
						, "to": 1458917411000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1458917411000
						, "to": 1458917422000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23"
						, "from": 1458917422000
						, "to": 1458918928000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1458918928000
						, "to": 1458919504000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23"
						, "from": 1458919504000
						, "to": 1459872409000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1459872409000
						, "to": 1460993069000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23"
						, "from": 1460993069000
						, "to": 1461745330000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1461745330000
						, "to": 1461745347000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23"
						, "from": 1461745347000
						, "to": 1461774181000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1461774181000
						, "to": 1461777151000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 23"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 23 просрочен"
						, "from": 1470417120000
						, "to": 1475072710000
						, "color": "#F9C4E1"
			  }
			  , {
						"desc": "Шаг 23"
						, "from": 1461777151000
						, "to": 1470417120000
						, "color": "#D0E4FD"
			  }
				]
		  }
		  , {
				"name": "Шаг 1"
				, "link": "#0"
				, "values": [
			  {
						"desc": "Шаг 1"
						, "from": 1483712640000
						, "to": 1499953482327
						, "color": "#F9C4E1"
			  }
			  , {
						"desc": "Шаг 1"
						, "from": 1475072710000
						, "to": 1483712640000
						, "color": "#D0E4FD"
			  }
				]
		  }
		]
		, "legendHelp": "Help"
	  }
	, fullCalendar : {
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
