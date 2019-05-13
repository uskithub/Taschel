<template lang="pug">
	.kanban-system-container.daily
		ul.kanban-board-container
			li.kanban-board.kanban-board-weekly-tasks(key="weekly")
				span.kanban-board-header
					legend {{ _("Tasks") }}
				.drag-options
				ul.kanban-list(data-type="board", data-id="weekly")
					kanban.top-level-item(v-for="kanban in kanbans", :kanban="kanban", :key="kanban.id", :draggable="false")
		ul.kanban-board-container.fullcalendar
			li.kanban-board(key="schedule")
				fullcalendar(:events="events", :options="schema", :currentWeek="currentWeek")
</template>

<script>
	import Vue from "vue";
	import AbstractView from "system/mixins/abstractView";

	import Board from "plugins/kanban/entities/board";

	import { mapGetters } from "vuex";

	import _schema from "./schema";
	import moment from "moment";

	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

	// TODO: これどうにかする
	const closedEventColor = _schema.fullCalendar.closedEventColor;
	const googleCalendarEventColor = _schema.fullCalendar.googleCalendarEventColor;

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

	export default {
		mixins : [ AbstractView ]
		, props: {
			schema : {
				type: Object
				, validator: function(value) { return true; } // TODO
				, required : true
			}
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
			return {
				workEntity: null
				, reviewingDate: null
				, reviewEntity: null
				, reviewingWorks: null
			};
		}
		, methods : {
			
			// 実際にはediting/reviewingから戻ってきた時の再描画でもviewRenderが呼ばれるので走っている
			didChangeWeek(view, elem) {
				// if (!this.isReady) return;

				// this.changeWeek(view.start)
				// 	.then(() => {
				// 		// this.popCrumb();
				// 		// this.pushCrumb({ id: "week", name: this.currentWeekOfMonth });
				// 		this.getCurrentWeekTasks();
				// 		this.getCurrentWeekWorks();
				// 		this.getCurrentWeekReviews();
				// 	});
			}
			, didReceiveCloseEvent(rawValues, withTask = false) {
				// this.isEditing = false;
				// this.isReviewing = false;
				// this.popCrumb();
				// this.$nextTick(() => {
				// 	this.workEntity = null;
				// 	this.reviewingDate = null;
				// 	this.reivewEntity = null;
				// 	this.reviewingWorks = null;
				// });
			}
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
	};
</script>

<style lang="scss" scoped>
	// @see http://makotottn.hatenablog.com/entry/2017/08/29/004422
	// @import "../../../../../../node_modules/fullcalendar/dist/fullcalendar.css";
	@import "fullcalendar/dist/fullcalendar.css";

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