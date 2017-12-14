<template lang="pug">
	kanban-page(:schema="schema", :selectedProject="selectedProject", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :users="users")
</template>

<script>
	import Vue from "vue";
	import KanbanPage from "../../core/DefaultKanbanPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD, LOAD_PROJECTS, SELECT_PROJECT, DESELECT_PROJECT, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE } from "../../common/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
			KanbanPage: KanbanPage
		},

		// getters.js に対応
		computed: mapGetters("kanbanPage", [
			"projects"
			, "tasks"
			, "users" 
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
			prefix: "/kanban/",
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
			...mapMutations("kanbanPage", {
				_selectProject : SELECT_PROJECT
				, selectRow : SELECT
				, _deselectProject : DESELECT_PROJECT
				, loadTasks : LOAD
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("kanbanPage", {
				getTasks : "readTasks"
				, updateModel : "updateTask"
				, createModel : "createGroup"
				, deleteModel : "deleteTask"
			})
			, selectProject(row) {
				this._selectProject(row);
				this.getTasks({
					options: { root : row.code }
					, mutation: LOAD
				});
			}
			, deselectProject() {
				this._deselectProject();
				this.loadTasks([]);
			}
		},

		/**
		 * Call if the component is created
		 */
		created() {
			// Download rows for the page
			this.getTasks({
				options: { taskType : "project" }
				, mutation: LOAD_PROJECTS
			});
		}
	};
</script>