<template lang="pug">
	section
		gantt(:data="mock", :treenodes="treenodes" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")
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
	import Task from "../../../fundamentals/entities/task";
	import Treenode from "../treenode";
	import { mapGetters, mapActions } from "vuex";
	import schema from "./schema";
	import moment from "moment";
	
	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

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

	schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "GanttChart"
		, mixins : [ Base ]
		, computed : {
			...mapGetters([
				"projects"
				, "currentProject"
			])
			, treenodes() {
				if (this.currentProject !== null) {
					return this.currentProject.tasks.map(t => {
						return new Treenode(t);
					});
				} else {
					return [];
				}
			}
		}
		, data() {
			schema.fullCalendar.resources = resources;
			return {
				formSchema : schema.form
				, fullcalendarSchema: schema.fullCalendar
				, mock : schema.data
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getUserProjectList"
				, "arrangeTasksInAnotherTask"
			])
			// Interfacial Operations
			, didArrangeTask({ treenode, from, to, index }) {
				console.log(treenode, from, to, index);

				let _from = { type: "task", code: from.id, entity: from.entity.task };
				let _to = { type: "task", code: to.id, entity: to.entity.task };

				this.arrangeTasksInAnotherTask({ task: treenode.task, from: _from, to: _to, index });
			}
			, addIconDidPush(e, treenode) {
				// create default values for new task according to its parent task.
				let parent = treenode.task;
				let entity = parent.childTaskFactory(this.me);

				this.showPopup({
					title: `${treenode.name} をブレークダウンします`
					, component: "task-form"
					, props: { 
						entity: entity
						, parent: parent 
						, schema: this.formSchema 
					} 
					, events: { "close" : e => {
						this.didClosePopup(e);
					} }
				});
				// this.showPopup(`<task-form :entity="entity" :parent="parent" :schema="schema"></task-form>`
				// 	, { TaskForm }
				// 	, ["entity", "parent", "schema"]
				// 	, { 
				// 		entity: entity
				// 		, parent: parent 
				// 		, schema: this.formSchema 
				// 	});
			}
		}
		, sessionEnsured(me) {
			return this.getUserProjectList()
				.then(() => {
					this.pushCrumb({ 
						id: "project"
						, name: this.currentProject.name
					});
				});
		}
	};
</script>

<style lang="scss" scoped>
</style>