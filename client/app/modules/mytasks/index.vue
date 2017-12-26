<template lang="pug">
	list-page(:schema="schema", :rows="tasks", :selected="selected", :model="model"
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
	import { LOAD_PROJECTS, SET_CURRENT_PROJECT, LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SET_USER } from "../common/constants/mutationTypes";

	export default {
		
		components : {
			ListPage: ListPage
		}
		, computed : {
			...mapGetters("shared", [
				"projects"
				, "currentProject"
			])
			, ...mapGetters("mytasksPage", [
				"tasks",
				"selected"
			])
			, ...mapGetters("session", [
				"me"
			])
		}

		/**
		 * Set page schema as data property
		 * インスタンスプロパティのような扱い。複数同じコンポーネントが一つの画面上で利用されていたとしも、
		 * 表示に関わる値を個別に持てるように、return objとしている。
		 */
		, data() {
			return {
				schema
				, model: null
			};
		}
		, watch: {
			// clearSelectionを呼ぶと呼ばれる
			selected(newTasks) {
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
				this.model = targetModel;
			}
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
				}

				, brokedown(res) {
					console.log("● brokedown on index.vue", res.data);
					this.updated(res.data.parent);
					this.created(res.data.child);
					// TODO: 連続でブレークダウンできるようにする
					// this.selectRow(res.data.child, false);
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
			...mapMutations("mytasksPage", {
				select : SELECT
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("mytasksPage", {
				getTasks : "readTasks"
				, updateTask : "updateTask"
				, createTask : "createTask"
				, deleteTask : "deleteTask"
				, checkTask : "checkTask"
			})
			, ...mapActions("session", [
				"getSessionUser"
			])

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
				newModel.asignee_code = this.me.code;
				this.model = newModel;
			}

			, save(model) {
				this.clearSelection();
				if (model.code) {
					this.updateTask( { model, mutation: UPDATE } );
				} else {
					this.createTask( { model, mutation: ADD } );
				}
			}

			, clone() {
				const baseModel = this.selected[0]; 
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
				this.deleteTask( { model: this.selected[0], mutation: REMOVE } );
				this.clearSelection();
			}
			, cancel() {
				this.clearSelection();
				this.model = null;
			}

			, setupProjectsField() {
				// 動的にプロジェクト一覧を設定している
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
		}

		/**
		 * Call if the component is created
		 * インスタンスが作成された後に同期的に呼ばれる
		 * データの監視とイベントの初期セットアップが完了した状態
		 */
		, created() {
			// projectの選択が変わったら、初期値を変える
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${LOAD_PROJECTS}`
					|| mutation.type == `shared/${SET_CURRENT_PROJECT}`
				) {
					this.setupProjectsField();
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

			if (this.me) {
				this.getTasks({ 
					options: { user : this.me.code }
					, mutation: `mytasksPage/${LOAD}`
				});
			} else {
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				this.$store.subscribe((mutation, state) => {
					if (mutation.type == `session/${SET_USER}`) {
						this.getTasks({ 
							options: { user : this.me.code }
							, mutation: `mytasksPage/${LOAD}`
						});
					}
				});				
			}
		}
	};
</script>