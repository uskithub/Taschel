<template lang="pug">
	list-page(:schema="schema", :selected="selected", :rows="projects", :me="me")
</template>

<script>
	import Vue from "vue";
	import ListPage from "../../core/DefaultListPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_PROJECTS, LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE } from "../../common/mutationTypes";

	export default {
		
		components: {
			ListPage: ListPage
		},

		computed: {
			...mapGetters("shared", [
				"projects"
			])
			, ...mapGetters("projectsPage", [
				"selected"
			])
			, ...mapGetters("session", [
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
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		socket: {
			prefix: "/tasks/",
			events: {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("追加しました"));
				}

				// TODO: ブレークダウン後のタスクがProjectに差し込まれてしまう
				// ブレークダウンを表示さないようにする
				, brokedown(res) {
					console.log("● brokedown on index.vue", res.data);
					this.updated(res.data.parent);
					this.created(res.data.child);
					this.selectRow(res.data.child, false);
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
		},		

		methods: {
			...mapMutations("projectsPage", {
				selectRow : SELECT
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("projectsPage", {
				getProjects : "readTasks"
				, updateRow : "updateTask"
				, saveRow : "createTask"
				, removeRow : "deleteTask"
			})
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			// Download rows for the page
			this.getProjects({
				options: { taskType : "project" }
				, mutation: `shared/${LOAD_PROJECTS}`
			});
		}
	};
</script>