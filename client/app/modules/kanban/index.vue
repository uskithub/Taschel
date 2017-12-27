<template lang="pug">
	kanban-page(:schema="schema", :selectedProject="currentProject", :projects="projects", :groups="groups", :tasks="tasks", :model="model"
		, @arrange="arrange" 
		, @add="generateModel"
		, @select-project="selectProject"
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

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD, LOAD_PROJECTS, ADD , UPDATE, REMOVE } from "../common/constants/mutationTypes";

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
				},

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				updated(res) {
					// this.updated(res.data);
					toast.success(this._("GroupUpdated", res), this._("更新しました"));
				},

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				removed(res) {
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
			}
			, cancel() {
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