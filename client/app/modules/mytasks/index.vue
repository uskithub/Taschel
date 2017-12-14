<template lang="pug">
	list-page(:schema="schema", :selected="selected", :rows="tasks")
</template>

<script>
	import Vue from "vue";
	import ListPage from "../../core/DefaultListPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapActions } from "vuex";

	export default {
		
		components : {
			ListPage: ListPage
		}
		, computed : {
			...mapGetters("common", [
				"tasks",
				"selected"
			]),
			...mapGetters("session", [
				"me"
			])
		}

		/**
		 * Set page schema as data property
		 */
		, data() {
			return {
				schema
			};
		}
		/**
		 * Socket handlers. Every property is an event handler
		 */
		, socket : {
			prefix : "/tasks/"
			, events : {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					// server側の this.notifyModelChanges(ctx, "created", json); で呼ばれる
					console.log("● created on index.vue", res.data);
					this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("追加しました"));
				},

				brokedown(res) {
					console.log("● brokedown on index.vue", res.data);
					this.brokedown(res.data);
					toast.success(this._("TaskNameAdded", res), this._("ブレークダウンしました"));
				}

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				, updated(res) {
					this.updated(res.data);
					toast.success(this._("TaskNameUpdated", res), this._("更新しました"));
				}

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				, removed(res) {
					this.removed(res.data);	
					toast.success(this._("TaskNameDeleted", res), this._("削除しました"));
				}
			}
		}		
		, methods : {
			...mapActions("common", [
				"downloadTasks"
				, "created"
				, "brokedown"
				, "updated"
				, "removed"
				, "selectRow"
				, "clearSelection"
				, "saveRow"
				, "updateRow"
				, "removeRow"
			])
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			// Download rows for the page
			this.downloadTasks({user : this.me.code});
		}
	};
</script>