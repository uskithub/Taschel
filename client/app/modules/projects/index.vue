<template lang="pug">
	list-page(:schema="schema", :rows="projects", :selected="selected", :model="model"
		, @add="generateModel"
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
	import ListPage from "../../core/DefaultListPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_PROJECTS, ADD_PROJECT, LOAD, SELECT, CLEAR_SELECT, UPDATE_PROJECT } from "../common/constants/mutationTypes";

	export default {
		
		components: {
			ListPage: ListPage
		}
		, computed: {
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
				, model: null
			};
		}
		, watch: {
			// clearSelectionを呼ぶと呼ばれる
			selected(newProjects) {
				if (newProjects.length == 0) {
					this.model = null;
					return;
				}
				const baseModel = newProjects[0];
				this.schema.popupForm.title = `${baseModel.name} を編集`;
				this.schema.popupForm.form.fields.forEach(f => {
					// if (f.model == "root_code") {
					// 	f.readonly = true;
					// 	f.disabled = true;
					// }
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
			prefix: "/tasks/"
			, events: {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					// this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("追加しました"));
				}

				// TODO: ブレークダウン後のタスクがProjectに差し込まれてしまう
				// ブレークダウンを表示さないようにする
				, brokedown(res) {
					console.log("● brokedown on index.vue", res.data);
					// this.updated(res.data.parent);
					// this.created(res.data.child);
					// this.selectRow(res.data.child, false);
					toast.success(this._("TaskNameAdded", res), this._("ブレークダウンしました"));
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

		, methods: {
			...mapMutations("projectsPage", {
				select : SELECT
				, clearSelection : CLEAR_SELECT
			})
			, ...mapActions("projectsPage", {
				getProjects : "readTasks"
				, createProject : "createTask"
				, updateProject : "updateTask"
				, deleteProject : "deleteTask"
			})

			, generateModel() {
				this.schema.popupForm.title = _("CreateNewProject");
				this.schema.popupForm.form.fields.forEach(f => {
					// if (f.model == "root_code") {
					// 	f.readonly = false;
					// 	f.disabled = false;
					// }
					return f;
				});

				let newModel = schemaUtils.createDefaultObject(this.schema.popupForm.form);
				newModel.asignee_code = this.me.code;
				this.model = newModel;
			}

			, save(model) {
				this.clearSelection();
				if (model.code) {
					this.updateProject( { model, mutation: `shared/${UPDATE_PROJECT}` } );
				} else {
					this.createProject( { model, mutation: `shared/${ADD_PROJECT}` } );
				}
			}
			, clone() {
				const baseModel = this.selected[0]; 
				this.schema.popupForm.title = `${baseModel.name} を元に新規作成`;
				this.schema.popupForm.form.fields.forEach(f => {
					// if (f.model == "root_code") {
					// 	f.readonly = false;
					// 	f.disabled = false;
					// }
					return f;
				});

				let clonedModel = cloneDeep(baseModel);
				clonedModel.id = null;
				clonedModel.code = null;
				clonedModel.children = [];
				clonedModel.works = [];
				clonedModel.asignee_code = this.me.code;
				this.model = clonedModel;
			}

			, breakdown() {
				const baseModel = this.selected[0]; 
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
				if (baseModel.root != -1) {
					brokedownModel.root_code = (baseModel.root.code) ? baseModel.root.code : baseModel.root;
				} else {
					// brokedownModel.root_code = baseModel.code;
				}
				brokedownModel.parent_code = baseModel.code;
				brokedownModel.asignee_code = this.me.code;
				this.model = brokedownModel;
			}
			, remove(){ 
				this.deleteProject( { model: this.selected[0], mutation: `shared/${REMOVE}` } );
				this.clearSelection();
			}
			, cancel() {
				this.clearSelection();
				this.model = null;
			}
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