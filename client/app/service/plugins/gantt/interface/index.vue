<template lang="pug">
	section
		gantt(:data="mock", :treelists="treelists")
		// table
		// 	tbody
		// 		tr
		// 			td
		// 				treelist(:treelists="treelists")
		// 			td
		// 				treelist(:treelists="treelists")
		// ganttchart(:options="fullcalendarSchema", :currentWeek="currentWeek")
</template>

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import { mapGetters, mapActions } from "vuex";
	import schema from "./schema";
	import moment from "moment";
	
	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

	class Treelist {
		constructor(task) {
			this._task = task;
			this._subtree = task.tasks.map(t => new Treelist(t));
		}
		get task() { return this._task; }
		get id() { return this._task.code; }
		get name() { return this._task.name; }
		get subtree() { return this._subtree; }
	}

	const resources = [
		{ id: 'a', building: '460 Bryant', title: 'Auditorium A' },
		{ id: 'b', building: '460 Bryant', title: 'Auditorium B' },
		{ id: 'c', building: '460 Bryant', title: 'Auditorium C' },
		{ id: 'd', building: '460 Bryant', title: 'Auditorium D' },
		{ id: 'e', building: '460 Bryant', title: 'Auditorium E' },
		{ id: 'f', building: '460 Bryant', title: 'Auditorium F' },
		{ id: 'g', building: '564 Pacific', title: 'Auditorium G' },
		{ id: 'h', building: '564 Pacific', title: 'Auditorium H' },
		{ id: 'i', building: '564 Pacific', title: 'Auditorium I' },
		{ id: 'j', building: '564 Pacific', title: 'Auditorium J' },
		{ id: 'k', building: '564 Pacific', title: 'Auditorium K' },
		{ id: 'l', building: '564 Pacific', title: 'Auditorium L' },
		{ id: 'm', building: '564 Pacific', title: 'Auditorium M' },
		{ id: 'n', building: '564 Pacific', title: 'Auditorium N' },
		{ id: 'o', building: '101 Main St', title: 'Auditorium O' },
		{ id: 'p', building: '101 Main St', title: 'Auditorium P' },
		{ id: 'q', building: '101 Main St', title: 'Auditorium Q' },
		{ id: 'r', building: '101 Main St', title: 'Auditorium R' },
		{ id: 's', building: '101 Main St', title: 'Auditorium S' },
		{ id: 't', building: '101 Main St', title: 'Auditorium T' },
		{ id: 'u', building: '101 Main St', title: 'Auditorium U' },
		{ id: 'v', building: '101 Main St', title: 'Auditorium V' },
		{ id: 'w', building: '101 Main St', title: 'Auditorium W' },
		{ id: 'x', building: '101 Main St', title: 'Auditorium X' },
		{ id: 'y', building: '101 Main St', title: 'Auditorium Y' },
		{ id: 'z', building: '101 Main St', title: 'Auditorium Z' }
	];
	
	export default {
		name : "GanttChart"
		, mixins : [ Base ]
		, computed : {
			...mapGetters([
				"projects"
				, "currentProject"
			])
			, treelists() {
				if (this.projects.length > 0) {
					return this.projects[0].tasks.map(t => {
						return new Treelist(t);
					});
				} else {
					return [];
				}
			}
		}
		, data() {
			schema.fullCalendar.resources = resources;
			return {
				fullcalendarSchema: schema.fullCalendar
				, mock : schema.data
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getUserProjectList"
			])
		}
		, sessionEnsured(me) {
			this.getUserProjectList();
		}
	};
</script>

<style lang="scss" scoped>
</style>