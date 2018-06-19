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

	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

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
		name : "DailyLoop"
		, mixins : [ Base ]
		, computed : {
			...mapGetters([
				"currentWeek"
				, "currentweekTaskGroup"
			])
			, kanbans() {
				if (this.currentweekTaskGroup) {
					return (new Board(this.currentweekTaskGroup)).kanbans;
				} else {
					return [];
				}
			}
		}
		, data() {
			schema.fullCalendar.drop = (date, jqEvent, ui, resourceId) => {
				console.log("drop");
			};

			// for user's dragging and dropping events
			schema.fullCalendar.eventDrop = (event, delta, revertFunc, jqEvent, ui, view) => {
				console.log("eventDrop");
			};

			// for user's expanding events.
			schema.fullCalendar.eventResize = (event, delta, revertFunc, jqEvent, ui, view) => {
				console.log("eventResize");
			};

			// for user's editing with popupForm
			schema.fullCalendar.eventClick = (event, jqEvent, view) => {
				console.log("eventClick");
			};

			schema.fullCalendar.viewRender = (view, elem) => {
				console.log("viewRender", view.start.format("YYYY-MM-DD"));
			};

			return {
				events: []
				, fullcalendarSchema: schema.fullCalendar
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getCurrentWeekTasks"
			])
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
<style lang="scss">
	// TODO: なんでscopedだとダメなんだろう
	.fc-divider.fc-widget-header { 
        width: 100%; 
	}
</style>