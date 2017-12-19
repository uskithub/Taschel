<template lang="pug">
	div
		kanban-page(:schema="schema", :groups="groups", :tasks="tasks")
		popup(:schema="popupSchema")
</template>

<script>
	import Vue from "vue";
    import KanbanPage from "../../core/DefaultKanbanPage.vue";
	import Popup from "../../core/components/popup";
	// import Popup from "../../core/components/header/dropdowns/messages";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD, LOAD_PROJECTS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SHOW_POPUP, HIDE_POPUP } from "../common/constants/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
            KanbanPage: KanbanPage
            , Popup: Popup
		}

		// getters.js に対応
		, computed: {
			...mapGetters("shared", [
				"projects"
				, "currentProject"
				, "popupSchema"
			])
			, ...mapGetters("weeklyPage", [
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
			};
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
					this.created(res.data);
					toast.success(this._("GroupAdded", res), this._("追加しました"));
				}

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				, updated(res) {
					this.updated(res.data);
					toast.success(this._("GroupUpdated", res), this._("更新しました"));
				}

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				, removed(res) {
					this.removed(res.data);	
					toast.success(this._("GroupDeleted", res), this._("削除しました"));
				}
			}
		}

		, methods: {
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT
				, showPopup : SHOW_POPUP
				, hidePopup : HIDE_POPUP
			})
			, ...mapMutations("weeklyPage", {
				selectRow : SELECT
				, loadTasks : LOAD
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("weeklyPage", {
				getProjects : "readTasks"
				, getGroups : "readGroups"
				, updateModel : "updateTask"
				, createModel : "createGroup"
				, deleteModel : "deleteTask"
				, arrange : "updateGroups"
			})
			, selectProject(code) {
				this.setCurrentProject(code);
				this.getGroups({
					options: { parent : code }
					, mutation: LOAD
				});
			}
			, deselectProject() {
				this.setCurrentProject(code);
				this.loadTasks([]);
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
            this.getGroups({
                options: { weekly : "2017-12-11" }
                , mutation: LOAD
            });
		}
	};
</script>