<template lang="pug">
	.container
		.kanban-system-container
			ul.kanban-board-container
				li.kanban-board.kanban-board-weekly-tasks(key="weekly")
					span.kanban-board-header
						legend {{ _("Tasks") }}
					.drag-options
					ul.kanban-list(data-type="board", data-id="weekly")
						kanban(v-for="kanban in kanbans", :kanban="kanban", :key="kanban.id", :draggable="false")
				li.kanban-board(key="schedule")
					fullcalendar(:events="events", :options="fullcalendarSchema", :currentWeek="currentWeek")
</template>

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import Board from "../../kanban/board";
	import Kanban from "../../kanban/kanban";
	import { mapGetters, mapActions } from "vuex";
	import schema from "./schema";
	import moment from "moment";

	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

	const closedEventColor = schema.fullCalendar.closedEventColor;
	const googleCalendarEventColor = schema.fullCalendar.googleCalendarEventColor;

	const convertWork2Event = work => {
		const isGoogleCalendar = (work.code === "GOOGLE_CALENDAR");
		return {
			id: work.code
			, title: work.title
			// , allDay: ???
			, start: work.start
			, end: work.end
			// , url: ???
			// , className: ???
			, editable: !isGoogleCalendar
			// , startEditable: ???
			, durationEditable: !isGoogleCalendar
			// , resourceEditable: ???
			// , rendering: ???
			// , overlap: ???
			// , constraint: ???
			// , source: ???
			, color: isGoogleCalendar ? googleCalendarEventColor.color : (work.status < 0 ? closedEventColor.color : null)
			// , backgroundColor: ???
			// , borderColor: ???
			, textColor: isGoogleCalendar ? googleCalendarEventColor.textColor : (work.status < 0 ? closedEventColor.textColor : null)
				
		};
	};

	const makeDraggable = () => {
		const kanbanItems = Array.from(document.querySelectorAll(".kanban-item"), el => { 
			el.dataset.duration = "1:00";
			return el; 
		});
		if (kanbanItems.length == 0) {
			return;
		}
		kanbanItems.forEach( t => {
			$(t).draggable({
				zIndex: 999
				, containment: ".kanban-system-container"
				, revert: true	// immediately snap back to original position
				, revertDuration: 0
				, start: e => {
					// $(this).addClass("is-moving");
				}
				, drag: e => {}
				, stop: e => {
					// $(this).removeClass("is-moving");
				}
			});
		});
	};

	// finding the task object has the code from the objects in the array.
	// recursivly finding its children.
	const findTask = (code, taskArr) => {
		for (let i in taskArr) {
			let t = taskArr[i];
			if (t.code === code) {
				return t;
			} else if (t.tasks.length > 0) {
				let result = findTask(code, t.tasks);
				if (result) {
					return result;
				}
			}
		}
		return null;
	};
	
	export default {
		name : "DailyLoop"
		, mixins : [ Base ]
		, computed : {
			...mapGetters([
				"currentWeek"
				, "currentweekTaskGroup"
				, "currentWeekWorks"
			])
			, kanbans() {
				if (this.currentweekTaskGroup) {
					return (new Board(this.currentweekTaskGroup)).kanbans;
				} else {
					return [];
				}
			}
			, events() {
				// the first day of currentWeek(mon), tue, wed, thu, fri, sat, sun
				let days = [0, 1, 2, 3, 4, 5].reduce((arr, i) => {
					arr.push(moment(arr[i]).add(1, "d").format("YYYY-MM-DD"));
					return arr;
				}, [this.currentWeek]);

				if (this.currentWeekWorks) {
					//return this.currentWeekWorks.map(w => new Event(w));
					return this.currentWeekWorks.map(convertWork2Event);
				} else {
					return [];
				}
			}
		}
		, data() {
			schema.fullCalendar.drop = this.didDropTask;
			schema.fullCalendar.eventDrop = this.didRelocateEvent;
			schema.fullCalendar.eventResize = this.didResizeEvent;
			schema.fullCalendar.eventClick = this.didClickEvent;
			schema.fullCalendar.viewRender = this.didChangeWeek;

			return {
				fullcalendarSchema: schema.fullCalendar
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getCurrentWeekTasks"
				, "getCurrentWeekWorks"
				, "addWork"
				, "editWork"
			])
			// Interfacial operations
			, didDropTask(date, jqEvent, ui, resourceId) {
				console.log("drop");
				// ignore dropped at all-day slot.
				if (!date.hasTime()) { return; }

				const code = $(jqEvent.target).data("id");
				const task = findTask(code, this.currentweekTaskGroup.tasks);
				const work = {
					title: task.name
					, start: date.utc().format()
					, end: date.add(1, "h").utc().format()
					, parent_code: task.code
					, week: this.currentWeek
					, author: this.me.code
				};
				this.addWork(work);
			}
			, didRelocateEvent(event, delta, revertFunc, jqEvent, ui, view) {
				const code = event.id;
				const start = moment(event.start).format();
				const end = moment(event.end).format();
				console.log("eventDrop", code, start, end);
				this.editWork({ code, start, end });
			}
			, didResizeEvent(event, delta, revertFunc, jqEvent, ui, view) {
				const code = event.id;
				const end = moment(event.end).format();
				console.log("eventResize");
				this.editWork({ code, end });
			}
			, didClickEvent(event, jqEvent, view) {
				console.log("eventClick");
			}
			, didChangeWeek(view, elem) {
				console.log("viewRender", view.start.format("YYYY-MM-DD"));
			}
		}
		, created() {
			this.pushCrumb({ id: "week", name: this.currentWeek });
		}
		, updated() {
			this.$nextTick(function () {
				makeDraggable();
			});
		}
		, mounted() {
			this.$nextTick(function () {
				makeDraggable();
			});
		}
		, sessionEnsured(me) {
			this.getCurrentWeekTasks();
			this.getCurrentWeekWorks();
		}
	};
</script>

<style lang="scss" scoped>

	.kanban-board-container {
		.kanban-board {
			overflow: visible;
		}
	}
</style>