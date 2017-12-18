<template lang="pug">
	task-page(:schema="schema", :selectedProject="currentProject", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :me="me")
</template>

<script>
	import Vue from "vue";
	import TaskPage from "../../core/DefaultTaskPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_USER, LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, LOAD_PROJECTS, LOAD_USERS, DESELECT } from "../common/constants/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
			TaskPage: TaskPage
		}

		// getters.js に対応
		, computed: {
			...mapGetters("shared", [
				"projects"
				, "users"
				, "currentProject"
			])
			, ...mapGetters("tasksPage", [
				"tasks" 
				, "selectedTasks"
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
				setCurrentProject : SET_CURRENT_PROJECT	// `this.setCurrentProject()` を `this.$store.commit(SET_CURRENT_PROJECT)` にマッピングする
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
			, ...mapActions("session", [
				"getSessionUser"
			])
			, selectProject(code) {
				this.setCurrentProject(code);
				this.getTasks({
					options: { root : code }
					, mutation: `tasksPage/${LOAD}`
				});
			}
			, deselectProject() {
				this.setCurrentProject(null);
				this.loadTasks([]);
			}
			, setupProjectsField() {
				console.log("●", this.currentProject);
				// 動的にプロジェクト一覧を設定している
				this.schema.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.values = this.projects.map(project => {
							return {
								id : project.code
								, name : project.name
							}
						});
						f.default = this.currentProject;
					}
				});
			}
			, setupAsigneeField() {
				// 動的にプロジェクト一覧を設定している
				this.schema.form.fields.forEach(f => {
					if (f.model == "asignee_code") {
						f.values = this.users.map(user => {
							return {
								id : user.code
								, name : user.username
							}
						});
						// f.default = this.me.code;
					}
				});
			}
		},

		/**
		 * Call if the component is created
		 */
		created() {
			// projectの選択が変わったら、初期値を変える
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${LOAD_PROJECTS}`
					|| mutation.type == `shared/${SET_CURRENT_PROJECT}`
				) {
					this.setupProjectsField();
				}
				if (mutation.type == `shared/${LOAD_USERS}`) {
					this.setupAsigneeField();
				}
			});	
			
			if (this.projects.length > 0) {
				this.setupProjectsField();

			} else {
				this.getTasks({ 
					options: { taskType : "project" }
					, mutation: `shared/${LOAD_PROJECTS}`
				});
			}

			if (this.currentProject) {
				this.getTasks({
					options: { root : this.currentProject }
					, mutation: `tasksPage/${LOAD}`
				});
			}

			if (this.users.length > 0) {
				this.setupAsigneeField();
			} else {
				this.getUsers({ mutation: `shared/${LOAD_USERS}` });	
			}
		}
	};
</script>