<template lang="pug">
	gantt-page(:schema="schema", :selectedProject="currentProject", :projects="projects", :model="model"
		@add="generateModel"
		@select-project="selectProject"
		@arrange="arrangeTask"
		@save="save"
		@clone="clone"
		@breakdown="breakdown"
		@remove="remove"
		@cancel="cancel"
	)
</template>

<script>
	import Vue from "vue";
	import SharedMixin from "../common/mixins/Shared.vue"
	import GanttPage from "../../core/DefaultGanttPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD_PROJECTS, UPDATE } from "../common/constants/mutationTypes";

	export default {
		mixins : [ SharedMixin ]
		, components : {
			GanttPage: GanttPage
		}
		, computed : {
		}

		/**
		 * Set page schema as data property
		 */
		, data() {
			return {
				// gant-pageに当てはめる値を定義したオブジェクト
				schema
				, model : null
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
				arranged(res) {
					console.log("● arranged", res);
					// this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("再配置しました"));
				}

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				, updated(res) {
					// this.updated(res.data);
					toast.success(this._("TaskNameUpdated", res), this._("更新しました"));
				}

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				, removed(res) {
					// this.removed(res.data);	
					toast.success(this._("TaskNameDeleted", res), this._("削除しました"));
				}
			}
		}		
		, methods : {
			...mapActions("ganttPage", {
				createTask : "createTask"
				, getProjects : "readTasks"
				, updateModel : "updateTask"
				, arrangeTask : "arrangeTask"
				, getUsers : "readUsers"
			})
			, selectProject(code) {
				this.setCurrentProject(code);
				// populateしているchildrenを辿って表示するので、getTasks的なことは不要
			}
			, generateModel(parent) {
				this.schema.popupForm.title = `${parent.name} に子タスクを追加`;
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.readonly = true;
						f.disabled = true;
					}
					return f;
				});

				let newModel = schemaUtils.createDefaultObject(this.schema.popupForm.form);
				
				newModel.type = this.setupDefaultTaskType(parent.type);
				newModel.purpose = `${parent.goal} にするため`;
				newModel.root_code = this.currentProject;
				newModel.parent_code = parent.code;
				newModel.asignee_code = this.me.code;
				this.model = newModel;
			}
			, save(model) {
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
					this.createTask( { model, mutation: `shared/${UPDATE}` } );
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
					if (f.model == "type") {
						f.values = this.setupTaskTypeField(baseModel.type);
					}
					return f;
				});

				let brokedownModel = cloneDeep(baseModel);
				brokedownModel.id = null;
				brokedownModel.code = null;
				brokedownModel.type = this.setupDefaultTaskType(baseModel.type);
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
			}
			, cancel() {
				this.model = null;
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			this.getProjects({
				options: { taskType : "project", populateParent : true }
				, mutation: `shared/${LOAD_PROJECTS}`
			});
		}
	};
</script>