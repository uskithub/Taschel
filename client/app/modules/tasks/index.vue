<template lang="pug">
	task-page(:schema="schema", :selectedProject="currentProject", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :users="users")
</template>

<script>
	import Vue from "vue";
	import TaskPage from "../../core/DefaultTaskPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, LOAD_PROJECTS, LOAD_USERS, DESELECT } from "../../common/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
			TaskPage: TaskPage
		}

		// getters.js に対応
		, computed: {
			...mapGetters("shared", [
				"currentProject"
			])
			, ...mapGetters("tasksPage", [
				"projects"
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
		}

		/**
		 * Socket handlers. Every property is an event handler
		 */
		, socket: {
			prefix: "/tasks/",
			events: {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					this.created(res.data);
					this.deselectTask(res.data);
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
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT
			})
			, ...mapMutations("tasksPage", {
				selectTasks : SELECT
				, loadTasks : LOAD
				, deselectTask : DESELECT
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, updated : UPDATE
				, removed : REMOVE
			})
			, ...mapActions("tasksPage", {
				getTasks : "readTasks"		// `this.getTasks()` を `this.$store.dispatch('getTasks')` にマッピングする
				, updateModel : "updateTask"
				, createModel : "createTask"
				, deleteModel : "deleteTask"
				, getUsers : "readUsers"
			})
			, selectProject(code) {
				this.setCurrentProject(code);
				this.getTasks({
					options: { root : code }
					, mutation: LOAD
				});
			}
			, deselectProject() {
				this.setCurrentProject(null);
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
				this.getTasks({
					options: { root : this.currentProject }
					, mutation: LOAD
				});
			}
			
			if (this.users.length == 0) {
				this.getUsers({ mutation: LOAD_USERS });	
			}
		}
	};
</script>