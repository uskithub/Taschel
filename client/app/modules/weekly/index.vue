<template lang="pug">

	kanban-page(:schema="schema", :currentWeek="currentWeek", :selectedTasks="selected", :users="users", :boardGroups="boardGroups", :tasks="tasks", :model="model"
		@arrange="arrange" 
		@add="generateModel"
		@selectUser="selectUser"
		@changeWeek="changeWeek"
		@select-kanban="selectKanban"
		@save="save"
		@remove="remove"
		@cancel="cancel"
	)
</template>

<script>
	import Vue from "vue";
    import KanbanPage from "../../core/DefaultWeeklyPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";
	import moment from "moment";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_CURRENT_WEEK, LOAD_USERS, SELECT_USER, SET_USER, LOAD, LOAD_PROJECTS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SHOW_POPUP, HIDE_POPUP } from "../common/constants/mutationTypes";

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
				, "users"
				, "selectedUser"
			])
			, ...mapGetters("weeklyPage", [
				"groups"
				, "tasks"
				, "selected"
			])
			, ...mapGetters("session", [
				"me"
			])
			, boardGroups() {
				return this.groups.reduce((groups, board, i) => {
					if (i == 0) {
						groups[0].boards.push(board);
					} else {
						groups[1].boards.push(board);
					}
					return groups;
				}, [{ name: "unclassified", boards: []}, { name: "classified", boards: []}]);
			}
			, userSelectorSchema() {
				if (this.users.length > 0) {
					const fields = this.schema.userSelector.fields.map(f => {
						if (f.model == "author") {
							f.values = this.users.map(user => {
								return {
									id : user.code
									, name : user.username
								}
							});
						}
						return f;
					});
					return { fields : fields };
				} else {
					return this.schema.userSelector;
				}
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
				// 選択したプロジェクトが格納される
				, modelUserSelector: {
					code : this.selectedUser
				}
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
			, selectedUser(newUser) {
				console.log(newUser);
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
				, _selectUser : SELECT_USER
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
				, getUsers : "readUsers"
			})
			, selectUser(code) { 
				console.log("● selectUser", code);
				this._selectUser(code); 
				if (code) {
					// TODO: user
					this.getGroups({
						options: { weekly : this.currentWeek }
						, mutation: LOAD
					});
				} else {
					this.loadGroups([]);
				}
			}
			, changeWeek(direction) {
				if (direction == "prev") {
					const newCurrent = moment(this.currentWeek).subtract(7, "d").format("YYYY-MM-DD");
					this.setCurrentWeek(newCurrent);
				} else {
					const newCurrent = moment(this.currentWeek).add(7, "d").format("YYYY-MM-DD");
					this.setCurrentWeek(newCurrent);
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
					if (model.parent_code == null) {
						// cloneでもbreakdownでもない新規の場合、parentもrootと同じにする
						model.parent_code = model.root_code;
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

				if (mutation.type == `shared/${SET_CURRENT_WEEK}`) {
					this.getGroups({
						options: { weekly : this.currentWeek }
						, mutation: LOAD
					});
				}

				// if (mutation.type == `shared/${LOAD_USERS}`) {
				// 	this.setupAsigneeField();
				// }
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

			if (!this.selectedUser) {
				if (this.me) {
					this._selectUser(this.me.code);
				} else {
					// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
					this.$store.subscribe((mutation, state) => {
						if (mutation.type == `session/${SET_USER}`) {
							this._selectUser(this.me.code);
							this.modelUserSelector.code = this.me.code;
						}
					});	
				}
			}

			// TODO: user
			this.getGroups({
				options: { weekly : this.currentWeek }
				, mutation: LOAD
			});

			if (this.users.length == 0) {
				this.getUsers({ mutation: `shared/${LOAD_USERS}` });	
			}
		}
	};
</script>
<style lang="scss">
	// @see https://www.webcreatorbox.com/tech/css-flexbox-cheat-sheet
	.drag-container {
		display: flex;
	}

	.drag-list {
		&.content {
			&.card-columns {
				flex-grow: 1;

				&:nth-child(2) {
					flex-grow: 2;
					display: flex;
					flex-direction: row-reverse;
					flex-wrap: wrap;
					align-items: stretch;
					align-content: flex-start;

					.drag-column {
						flex: inherit;
						flex-grow: inherit;
						width: 48%;
						margin: 0 1% 1% 1%;
					}
				}
			}
		}
	}
</style>