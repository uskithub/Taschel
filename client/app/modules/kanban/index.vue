<template lang="pug">
	kanban-page(:schema="schema", :selectedProject="currentProject", :selectedTasks="selected", :projects="projects", :boardGroups="boardGroups", :tasks="tasks", :model="model"
		@arrange="arrange" 
		@add="generateModel"
		@select-project="selectProject"
		@select-kanban="selectKanban"
		@save="save"
		@remove="remove"
		@cancel="cancel"
	)
</template>

<script>
	import Vue from "vue";
	import KanbanPage from "../../core/DefaultKanbanPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD, LOAD_PROJECTS, ADD , UPDATE, REMOVE, SELECT, CLEAR_SELECT } from "../common/constants/mutationTypes";

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
			])
			, ...mapGetters("kanbanPage", [
				"groups"
				, "tasks"
				, "selected"
			])
			, boardGroups() {
				return [{ name: "all", boards: this.groups}];
			}
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
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
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
			})
			, ...mapMutations("kanbanPage", {
				created : ADD
				, loadGroups : LOAD
				, updated : UPDATE
				, removed : REMOVE
				, selectKanban : SELECT
				, clearSelection : CLEAR_SELECT
			})
			, ...mapActions("kanbanPage", {
				getProjects : "readTasks"
				, getGroups : "readGroups"
				, createGroup : "createGroup"
				, updateGroups : "updateGroups"
			})
			, selectProject(code) {
				this.setCurrentProject(code);
				if (code) {
					this.getGroups({
						options: { parent : code }
						, mutation: LOAD
					});
				} else {
					this.loadGroups([]);
				}
			}
			, arrange(context) {
				// validation
				if (context.from == context.to && context.to == "UNCLASSIFIED") {
					// TODO: milestone板同士では移動ができてしまう
					return;
				}
				context.mutation = UPDATE;
				this.updateGroups(context);
			}
			, generateModel() {
				this.schema.popupForm.title = _("CreateNewGroup");

				let newModel = schemaUtils.createDefaultObject(this.schema.popupForm.form);
				if (this.currentProject) {
					newModel.parent_code = this.currentProject;
				}
				this.model = newModel;
			}
			, save(model) {
				this.clearSelection();
				if (model.code) {
					// TODO: 更新処理
					Console.log("TODO: update selected group.");
				} else {
					this.createGroup( { model, mutation: ADD } );
					this.model = null; // if didn't set null here, otherwise popupForm doesn't disapper.
				}
			}
			, remove(){ 
				// TODO
				Console.log("TODO: delete selected group.");
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
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			// projectがロードされたらprojectSelectorを作る
			// watchでやると初回時などに呼ばれないのでsubscribeしている
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${LOAD_PROJECTS}`) {
					this.setupProjectsField();
				}
			});	

			if (this.projects.length > 0) {
				this.setupProjectsField();
			} else {
				this.getProjects({ 
					options: { taskType : "project" }
					, mutation: `shared/${LOAD_PROJECTS}`
				});
			}

			if (this.currentProject) {
				this.getGroups({
					options: { parent : this.currentProject }
					, mutation: LOAD
				});
			}
		}
	};
</script>