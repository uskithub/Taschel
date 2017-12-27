<template lang="pug">
	task-page(:schema="schema", :selectedProject="currentProject", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :model="model"
		, @add="generateModel"
		, @select-project="selectProject"
		, @select="select"
		, @save="save"
		, @clone="clone"
		, @breakdown="breakdown"
		, @remove="remove"
		, @cancel="cancel"
	)
</template>

<script>
	import Vue from "vue";
	import TaskPage from "../../core/DefaultTaskPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

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
				, model: null
			};
		}
		, watch: {
			// clearSelectionを呼ぶと呼ばれる
			selectedTasks(newTasks) {
				if (newTasks.length == 0) {
					this.model = null;
					return;
				}
				const baseModel = newTasks[0];
				this.schema.popupForm.title = `${baseModel.name} を編集`;
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.readonly = true;
						f.disabled = true;
					}
					return f;
				});

				let targetModel = cloneDeep(baseModel);
				if (targetModel.root && targetModel.root != -1) {
					targetModel.root_code = (targetModel.root.code) ? targetModel.root.code : targetModel.root;
				}
				if (targetModel.asignee && targetModel.asignee != -1) {
					targetModel.asignee_code = (targetModel.asignee.code) ? targetModel.asignee.code : targetModel.asignee;
				}
				this.model = targetModel;
			}
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
					// this.created(res.data);
					// this.deselectTask(res.data);
					toast.success(this._("TaskNameAdded", res), this._("追加しました"));
				},

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				updated(res) {
					// this.updated(res.data);
					toast.success(this._("TaskNameUpdated", res), this._("更新しました"));
				},

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				removed(res) {
					// this.removed(res.data);	
					toast.success(this._("TaskNameDeleted", res), this._("削除しました"));
				}
			}
		},		

		methods: {
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT	// `this.setCurrentProject()` を `this.$store.commit(SET_CURRENT_PROJECT)` にマッピングする
			})
			, ...mapMutations("tasksPage", {
				select : SELECT
				, loadTasks : LOAD
				, deselectTask : DESELECT
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, updated : UPDATE
				, removed : REMOVE
			})
			, ...mapActions("tasksPage", {
				getTasks : "readTasks"		// `this.getTasks()` を `this.$store.dispatch('getTasks')` にマッピングする
				, updateTask : "updateTask"
				, createTask : "createTask"
				, deleteTask : "deleteTask"
				, getUsers : "readUsers"
			})
			, ...mapActions("session", [
				"getSessionUser"
			])
			, selectProject(code) {
				this.setCurrentProject(code);
				if (code) {
					this.getTasks({
						options: { root : code }
						, mutation: `tasksPage/${LOAD}`
					});
				} else {
					this.loadTasks([]);
				}
			}
			, generateModel() {
				this.schema.popupForm.title = _("CreateNewTask");
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.readonly = false;
						f.disabled = false;
					}
					return f;
				});

				let newModel = schemaUtils.createDefaultObject(this.schema.popupForm.form);
				// projectが設定されている場合、projectを設定
				if (this.currentProject) {
					newModel.root_code = this.currentProject;
					// parent_codeは画面上から選べないが、root_code（project）は選べるので、
					// projectを変えると不整合が起きるため、save時のroot_codeをコピーする
					//newModel.parent_code = this.currentProject;
				}
				newModel.asignee_code = this.me.code;
				this.model = newModel;
			}
			, save(model) {
				this.clearSelection();
				if (model.code) {
					this.updateTask( { model, mutation: UPDATE } );
				} else {
					// TODO: 新規作成時、Projectを未選択にして登録することができてしまう
					// この時、root=parent=-1で、type="step"などとなってしまう
					if (model.root_code != this.currentProject) {
						this.selectProject(model.root_code);
						if (model.parent_code == null) {
							// cloneでもbreakdownでもない新規の場合、parentもrootと同じにする
							model.parent_code = model.root_code;
						}
					}
					this.createTask( { model, mutation: ADD } );
					this.model = null;
				}
			}
			, clone() {
				const baseModel = this.selectedTasks[0]; 
				this.schema.popupForm.title = `${baseModel.name} を元に新規作成`;
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.readonly = false;
						f.disabled = false;
					}
					return f;
				});

				let clonedModel = cloneDeep(baseModel);
				clonedModel.id = null;
				clonedModel.code = null;
				if (clonedModel.root && clonedModel.root != -1) {
					clonedModel.root_code = (clonedModel.root.code) ? clonedModel.root.code : clonedModel.root;
				}
				if (clonedModel.parent && clonedModel.parent != -1) {
					clonedModel.parent_code = (clonedModel.parent.code) ? clonedModel.parent.code : clonedModel.parent;
				}
				clonedModel.children = [];
				clonedModel.works = [];
				clonedModel.asignee_code = this.me.code;
				this.model = clonedModel;
			}
			, breakdown() {
				const baseModel = this.selectedTasks[0]; 
				this.schema.popupForm.title = `${baseModel.name} をブレークダウン`;
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.readonly = false;
						f.disabled = false;
					}
					return f;
				});

				let brokedownModel = cloneDeep(baseModel);
				brokedownModel.id = null;
				brokedownModel.code = null;
				brokedownModel.type = "step";
				brokedownModel.name = null;
				brokedownModel.purpose = `${this.model.goal} にするため`;
				brokedownModel.goal = null;
				brokedownModel.children = [];
				brokedownModel.works = [];
				if (baseModel.root && baseModel.root != -1) {
					brokedownModel.root_code = (baseModel.root.code) ? baseModel.root.code : baseModel.root;
				} else {
					// brokedownModel.root_code = baseModel.code;
				}
				brokedownModel.parent_code = baseModel.code;
				brokedownModel.asignee_code = this.me.code;
				this.model = brokedownModel;
			}
			, remove(){ 
				this.deleteTask( { model: this.selectedTasks[0], mutation: REMOVE } );
				this.clearSelection();
			}
			, cancel() {
				this.clearSelection();
				this.model = null;
			}
			, setupProjectsField() {
				// 動的にプロジェクト一覧を設定している
				this.schema.projectSelector.fields.forEach(f => {
					if (f.model == "code") {
						f.values = this.projects.map(p => {
							return { id : p.code, name : p.name }
						});
					}
				});	
				this.schema.popupForm.form.fields.forEach(f => {
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
				this.schema.popupForm.form.fields.forEach(f => {
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
			// watchでやると初回時などに呼ばれないのでsubscribeしている
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
					, mutation: LOAD
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