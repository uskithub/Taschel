<template lang="pug">
	kanban-page(:schema="schema", :selectedProject="currentProject", :selectedTasks="selectedTasks", :projects="projects", :groups="groups", :tasks="tasks", :users="users")
</template>

<script>
	import Vue from "vue";
	import KanbanPage from "../../core/DefaultKanbanPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD, LOAD_PROJECTS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE } from "../../common/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
			KanbanPage: KanbanPage
		},

		// getters.js に対応
		computed: {
			...mapGetters("shared", [
				"currentProject"
			])
			, ...mapGetters("kanbanPage", [
				"projects"
				, "groups"
				, "tasks"
				, "users"
				, "selectedTasks"
			])
		}

		/**
		 * Set page schema as data property
		 */
		, data() {
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
					toast.success(this._("GroupAdded", res), this._("追加しました"));
				},

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("GroupUpdated", res), this._("更新しました"));
				},

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("GroupDeleted", res), this._("削除しました"));
				}
			}
		},		

		methods: {
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT
			})
			, ...mapMutations("kanbanPage", {
				selectRow : SELECT
				, loadTasks : LOAD
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("kanbanPage", {
				getTasks : "readTasks"
				, getGroups : "readGroups"
				, updateModel : "updateTask"
				, createModel : "createGroup"
				, deleteModel : "deleteTask"
				, arrange : "updateGroups"
			})
			, selectProject(code) {
				this.setCurrentProject(code);
				this.getGroups({
					options: { parent : code }
					, mutation: LOAD
				});
			}
			, deselectProject() {
				this.setCurrentProject(code);
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

			if (this.currentProject) {
				this.getGroups({
					options: { parent : this.currentProject }
					, mutation: LOAD
				});
			}
		}
	};
</script>