<template lang="pug">
	task-page(:schema="schema", :selectedProject="selectedProject", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks")
</template>

<script>
	import Vue from "vue";
	import TaskPage from "../../core/DefaultTaskPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapActions } from "vuex";

	export default {
		
		components: {
			TaskPage: TaskPage
		},

		// getters.js に対応
		computed: mapGetters("tasks", [
			"projects"
			, "tasks"
			, "selectedProject"
			, "selectedTasks"
		]),

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				// task-pageに当てはめる値を定義したオブジェクト
				schema
			};
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		socket: {

			prefix: "/projects/",

			events: {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("追加しました"));
				},

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("TaskNameUpdated", res), this._("更新しました"));
				},

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("TaskNameDeleted", res), this._("削除しました"));
				}
			}
		},		

		methods: {
			// actions.jsと対応
			...mapActions("tasks", [
				"downloadProjects"
				, "created"
				, "updated"
				, "removed"
				, "selectProject"
				, "selectTasks"
				, "deselectProject"
				, "deselectTask"
				, "clearSelection"
				, "saveRow"
				, "updateRow"
				, "removeRow"
			])
		},

		/**
		 * Call if the component is created
		 */
		created() {
			// Download rows for the page
			this.downloadProjects();
		}
	};
</script>