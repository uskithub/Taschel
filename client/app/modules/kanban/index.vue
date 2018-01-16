<template lang="pug">
	// TODO: AddはGroupの追加でselectはTaskの編集になっていて、popupFormがおかしい
	kanban-page(:schema="schema", :selectedProject="currentProject", :selectedTasks="selectedTasks", :projects="projects", :boardGroups="boardGroups", :model="model"
		@arrange="arrange" 
		@add="generateModel"
		@select-project="selectProject"	
		@_select-kanban="selectKanban"
		@save="save"
		@remove="remove"
		@cancel="cancel"
	)
</template>

<script>
	import Vue from "vue";
	import SharedMixin from "../common/mixins/Shared.vue"
	import KanbanPage from "../../core/DefaultKanbanPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD, ADD , UPDATE, REMOVE, SELECT, CLEAR_SELECT } from "../common/constants/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		mixins : [ SharedMixin ]
		, components: {
			KanbanPage: KanbanPage
		}

		// getters.js に対応
		, computed: {
			...mapGetters("kanbanPage", [
				"groups"
				, "selectedTasks"
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
			prefix: "/groups/"
			, events: {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					console.log(res.user, res.json);
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
			...mapMutations("kanbanPage", {
				created : ADD
				, loadGroups : LOAD
				, updated : UPDATE
				, removed : REMOVE
				, selectKanban : SELECT
				, clearSelection : CLEAR_SELECT
			})
			, ...mapActions("kanbanPage", {
				getGroups : "readGroups"
				, createGroup : "createGroup"
				, updateGroups : "updateGroups"
				, arrangeTask : "arrangeTask2"
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
			// { moving: { type: "task", code: el.dataset.code }
			//	, from: { type: source.dataset.type, code: source.dataset.code }
			//	, to: { type: target.dataset.code, code: target.dataset.code }
			//	, index: index 
			// }
			, arrange(context) {
				const milestonePrefix = "MILESTONE-";
				// TODO: validation
				if (context.from.code == context.to.code && context.to.code == "UNCLASSIFIED") {
					return;
				}

				if (context.from.type == "group" && context.from.code.indexOf(milestonePrefix) === 0) {
					context.from.type = "task";
					context.from.code = context.from.code.replace(milestonePrefix, "");
				}

				if (context.to.type == "group" && context.to.code.indexOf(milestonePrefix) === 0) {
					context.to.type = "task";
					context.to.code = context.to.code.replace(milestonePrefix, "");
				}

				context.parent_code = this.currentProject;
				context.mutation = UPDATE;

				if ((context.from.type == "task" || context.from.code == "UNCLASSIFIED") 
					&& (context.to.type == "task" || context.to.code == "UNCLASSIFIED")) {
					// task
					if (context.from.code == "UNCLASSIFIED") {
						context.from.type = "task";
						context.from.code = this.currentProject;
					} else if (context.to.code == "UNCLASSIFIED") {
						context.to.type = "task";
						context.to.code = this.currentProject;
					}
					this.arrangeTask(context);
				} else {
					// group
					this.updateGroups(context);
				}
			}
			, generateModel() {
				this.schema.popupForm.title = _("CreateNewGroup");

				let newModel = schemaUtils.createDefaultObject(this.schema.popupForm.form);
				newModel.parent_code = this.currentProject;
				newModel.type = "kanban";
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
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			if (this.currentProject) {
				this.getGroups({
					options: { parent : this.currentProject }
					, mutation: LOAD
				});
			}
		}
	};
</script>