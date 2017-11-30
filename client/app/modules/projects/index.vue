<template lang="pug">
	admin-page(:schema="schema", :selected="selected", :rows="tasks")
</template>

<script>
	import Vue from "vue";
	import AdminPage from "../../core/DefaultAdminPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapActions } from "vuex";

	export default {
		
		components: {
			AdminPage: AdminPage
		},

		computed: mapGetters("common", [
			"tasks",
			"selected"
		]),

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
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
			...mapActions("common", [
				"downloadTasks",
				"created",
				"updated",
				"removed",
				"selectRow",
				"clearSelection",
				"saveRow",
				"updateRow",
				"removeRow"
			])
		},

		/**
		 * Call if the component is created
		 */
		created() {
			// Download rows for the page
			this.downloadTasks({ taskType : "project" });
		}
	};
</script>