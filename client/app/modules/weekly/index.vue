<template lang="pug">
	div
		kanban-page(:schema="schema", :selectedTasks="selected", :groups="groups", :tasks="tasks", :model="model"
			, @arrange="arrange" 
			, @add="generateModel"
			, @select-kanban="selectKanban"
			, @save="save"
			, @remove="remove"
			, @cancel="cancel"
		)
</template>

<script>
	import Vue from "vue";
    import KanbanPage from "../../core/DefaultKanbanPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";
	import moment from "moment";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_CURRENT_WEEK, LOAD, LOAD_PROJECTS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SHOW_POPUP, HIDE_POPUP } from "../common/constants/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
            KanbanPage: KanbanPage
		}

		// getters.js に対応
		, computed: {
			...mapGetters("shared", [
				"projects"
				, "currentProject"
				, "currentWeek"
				, "popupSchema"
			])
			, ...mapGetters("weeklyPage", [
				"groups"
				, "tasks"
				, "selected"
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
			prefix: "/groups/"
			, events: {
                empty(res) {
					this.showPopup({
						title : this._("GroupIsEmpty")
						, message : this._("GroupIsEmpty")
						, buttons : [
							{
								type: "SUCCESS"
								, label : "OK"
								, action: () => {
									console.log("●", this);
									this.hidePopup();
								}
							}
						]
					});
				}

				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				, created(res) {
					// this.created(res.data);
					toast.success(this._("GroupAdded", res), this._("追加しました"));
				}

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				, updated(res) {
					// this.updated(res.data);
					toast.success(this._("GroupUpdated", res), this._("更新しました"));
				}

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				, removed(res) {
					// this.removed(res.data);	
					toast.success(this._("GroupDeleted", res), this._("削除しました"));
				}
			}
		}

		, methods: {
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT
				, setCurrentWeek : SET_CURRENT_WEEK
				, showPopup : SHOW_POPUP
				, hidePopup : HIDE_POPUP
			})
			, ...mapMutations("weeklyPage", {
				selectKanban : SELECT
				, loadTasks : LOAD
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("weeklyPage", {
				getTasks : "readTasks"
				, getGroups : "readGroups"
				, updateTask : "updateTask"
				, createTask : "createTask"
				, deleteTask : "deleteTask"
				, arrange : "updateGroups"
			})
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
					// TODO: 新規作成時、Projectを未選択にして登録することができてしまう
					// この時、root=parent=-1で、type="step"などとなってしまう
					if (model.root_code != this.currentProject) {
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

			if (!this.currentWeek) {
				this.setCurrentWeek(moment().day(1).format("YYYY-MM-DD"));
			}

            this.getGroups({
                options: { weekly : this.currentWeek }
                , mutation: LOAD
            });
		}
	};
</script>