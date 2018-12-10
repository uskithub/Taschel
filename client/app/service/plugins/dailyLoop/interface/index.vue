<template lang="pug">
	.container
		editing(v-if="isEditing", :entity="workEntity", :schema="formSchema" @close="didReceiveCloseEvent")
		reviewing(v-else-if="isReviewing", :entity="reviewEntity", :reviewingWorks="reviewingWorks", :schema="formSchema" @close="didReceiveCloseEvent")
		.kanban-system-container.daily(v-else)
			ul.kanban-board-container
				li.kanban-board.kanban-board-weekly-tasks(key="weekly")
					span.kanban-board-header
						legend {{ _("Tasks") }}
					.drag-options
					ul.kanban-list(data-type="board", data-id="weekly")
						kanban(v-for="kanban in kanbans", :kanban="kanban", :key="kanban.id", :draggable="false")
			ul.kanban-board-container.fullcalendar
				li.kanban-board(key="schedule")
					fullcalendar(:events="events", :options="fullcalendarSchema", :currentWeek="currentWeek")
</template>

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import Work from "../../../fundamentals/entities/work";
	import Board from "../../kanban/board";
	import Kanban from "../../kanban/kanban";
	import Editing from "./editing";
	import Reviewing from "./reviewing";
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

	schema.form.groups = Work.createFormSchema(schema.form.groups);

	export default {
		name : "DailyLoop"
		, mixins : [ Base ]
		, components : {
			Editing
			, Reviewing
		}
		, computed : {
			...mapGetters([
				"currentWeek"
				, "currentweekTaskGroup"
				, "currentWeekWorks"
				, "currentWeekReviews"
			])
			, kanbans() {
				if (this.currentweekTaskGroup) {
					return (new Board(this.currentweekTaskGroup)).kanbans;
				} else {
					return [];
				}
			}
			, events() {
				let sunDay = moment(this.currentWeek).add(-1, "d")
				let days = [1, 2, 3, 4, 5, 6].reduce((arr, i) => {
					arr.push(moment(sunDay).add(i, "d").format("YYYY-MM-DD"));
					return arr;
				}, [sunDay.format("YYYY-MM-DD")]);

				let _events = days.map(d => {
					const r = this.currentWeekReviews ? this.currentWeekReviews.find(r => { return r.date === d; }) : null;
					if (r) {
						return {
							id: r.code
							, title: "済"
							, allDay: true
							, start: d
							, editable: false
							, color: closedEventColor.color
						};
					}
					return {
						title: "未"
						, allDay: true
						, start: d
						, editable: false
					};
				});

				if (this.currentWeekWorks) {
					//return this.currentWeekWorks.map(w => new Event(w));
					return _events.concat(this.currentWeekWorks.map(convertWork2Event));
				} else {
					return _events;
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
				isEditing: false
				, isReviewing: false
				, workEntity: null
				, reviewEntity: null
				, reviewingWorks: null
				, formSchema : schema.form
				, fullcalendarSchema: schema.fullCalendar
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getCurrentWeekTasks"
				, "getCurrentWeekWorks"
				, "getCurrentWeekReviews"
				, "addWork"
				, "editWork"
				, "changeWeek"
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
					, week: this.currentWeek.format("YYYY-MM-DD")
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
				if (event.id == "GOOGLE_CALENDAR") return;
				if (event.allDay) {
					console.log(`●`, event);
					const dayOfWeek = event.start.day();
					for (let i in this.currentWeekReviews) {
						let review = this.currentWeekReviews[i];
						if (review.code === event.id) {
							this.reviewEntity = review;
							break;
						}
					}
					this.reviewingWorks = this.currentWeekWorks.filter(w => {
						return moment(w.start).day() === this.dayOfWeek; //&& w.status < 0;
					});
					this.isReviewing = true;

				} else {
					for (let i in this.currentWeekWorks) {
						let work = this.currentWeekWorks[i];
						if (work.code == event.id) {
							this.workEntity = work;
							this.isEditing = true;
							return;
						}
					}
				}
			}
			, didChangeWeek(view, elem) {
				if (!this.isReady) return;

				this.changeWeek(view.start)
					.then(() => {
						this.popCrumb();
						this.pushCrumb({ id: "week", name: this.currentWeekOfMonth });
						this.getCurrentWeekTasks();
						this.getCurrentWeekWorks();
					});
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				this.isReviewing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.workEntity = null;
					this.reivewEntity = null;
					this.reviewingWorks = null;
				});
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("DailyLoop") });
			this.pushCrumb({ id: "week", name: this.currentWeekOfMonth });
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
			this.getCurrentWeekReviews();
		}
	};
</script>

<style lang="scss" scoped>
	// @see http://makotottn.hatenablog.com/entry/2017/08/29/004422
	@import "../../../../../../node_modules/fullcalendar/dist/fullcalendar.css";

	.kanban-system-container {
		&.daily {
			display: flex;

			.kanban-board-container {
				flex: 1;
				
				&.fullcalendar {
					flex-grow: 2;
				}
			}
		}
	}
</style>