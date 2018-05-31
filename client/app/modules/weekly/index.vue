<template lang="pug">
	weekly-page(:schema="schema", :currentWeek="currentWeek", :selectedTasks="selectedTasks", :currentUser="currentUser", :users="users", :boardGroups="boardGroups", :model="model"
		@arrange="arrange" 
		@add="generateModel"
		@selectUser="selectUser"
		@changeWeek="changeWeek"
		@select-kanban="selectKanban"
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
    import WeeklyPage from "../../core/DefaultWeeklyPage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isObject } from "lodash";

	import toast from "../../core/toastr";
	import moment from "moment";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_CURRENT_WEEK, SET_CURRENT_USER, LOAD_USERS, SET_USER, LOAD, LOAD_PROJECTS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SHOW_POPUP, HIDE_POPUP } from "../common/constants/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		mixins : [ SharedMixin ]
		, components: {
            WeeklyPage: WeeklyPage
		}
		, computed: {
			...mapGetters("weeklyPage", [
				"groups"
				, "selectedTasks"
			])
			, boardGroups() {
				return this.groups.reduce((groups, board, i) => {
					board = this.populateRoot(board);
					if (i == 0) {
						groups[0].boards.push(board);
					} else {
						groups[1].boards.push(board);
					}
					return groups;
				}, [{ name: "unclassified", boards: []}, { name: "classified", boards: []}]);
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
			, currentUser(newUser) {
				console.log("● watch", newUser);
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
			...mapMutations("weeklyPage", {
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
			, selectUser(code) { 
				this.setCurrentUser(code); 
				if (code) {
					this.getGroups({
						options: { weekly : this.currentWeek, user_code : code }
						, mutation: LOAD
					});
				}
			}
			// , arrange(context) {
			// 	console.log(context);
			// }
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
			if (this.projects.length == 0) {
				this.getTasks({ 
					options: { taskType : "project", populateParent : true }
					, mutation: `shared/${LOAD_PROJECTS}`
				});
			}
			// projectの選択が変わったら、初期値を変える
			this.$store.subscribe((mutation, state) => {
				if (mutation.type === `shared/${SET_CURRENT_WEEK}`) {
					this.getGroups({
						options: { weekly : this.currentWeek, user_code : this.currentUser }
						, mutation: LOAD
					});
				}

				if (mutation.type === `shared/${LOAD_USERS}`) {
					this.schema = this.setupUserSelector(this.schema);
				}
			});

			if (!this.currentUser) {
				if (this.me) {
					this.setCurrentUser(this.me.code);
				} else {
					// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
					this.$store.subscribe((mutation, state) => {
						if (mutation.type === SET_USER) {
							const me = state.session.me;
							this.setCurrentUser(me.code);
						}
					});	
				}
				this.getGroups({
					options: { weekly : this.currentWeek }
					, mutation: LOAD
				});
			} else {
				this.getGroups({
					options: { weekly : this.currentWeek, user_code : this.currentUser }
					, mutation: LOAD
				});
			}
		}
	};
</script>