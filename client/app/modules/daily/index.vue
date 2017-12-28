<template lang="pug">
	schedule-page(:schema="schema", :selected="selected", :tasks="assignedInWeeklyTasks", :works="works", :currentWeek="currentWeek", :model="model"
		@assign="assign"
		@select="select"
		@update="update"
		@set-current-week="setCurrentWeek"
		@save="save"
		@close="close"
		@remove="remove"
		@cancel="cancel"
	)
</template>

<script>
	import Vue from "vue";
    import SchedulePage from "../../core/DefaultSchedulePage.vue";
	import Popup from "../../core/components/popup";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import toast from "../../core/toastr";
	import moment from "moment";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_CURRENT_WEEK, LOAD, LOAD_WORKS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SET_USER, SHOW_POPUP, HIDE_POPUP } from "../common/constants/mutationTypes";

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		
		components: {
            SchedulePage: SchedulePage
            , Popup: Popup
		}

		// getters.js に対応
		, computed: {
			...mapGetters("shared", [
				"projects"
				, "currentProject"
				, "currentWeek"
				, "popupSchema"
			])
			, ...mapGetters("dailyPage", [
				"assignedInWeeklyTasks"
				, "works"
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
			// This func is called when user select any work.
			// you should manage comtents of popupForm you want to show.
			// notice: when you call clearSelection, this func also will be called
			selected(newWorks) {
				if (newWorks.length == 0) {
					this.model = null;
					return;
				}
				const baseModel = newWorks[0];
				this.schema.popupForm.title = `${baseModel.name} を編集`;

				let actualStartFormat, actualEndFormat;
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "actualStart") {
						if (!f._label) { f._label = f.label; } // save for next select.
						console.log(baseModel.start);
						actualStartFormat = f.format;
						const _start = moment(baseModel.start).format(actualStartFormat);
						f.label = `${f._label}（予定：${_start}）`;
						// I don't know why but default value will be cleared when user input any other field like goal...
						// f.dateTimePickerOptions.defaultDate = baseModel.start;
					} else if (f.model == "actualEnd") {
						if (!f._label) { f._label = f.label; } // save for next select.
						actualEndFormat = f.format;
						const _end = moment(baseModel.end).format(actualEndFormat);
						f.label = `${f._label}（予定：${_end}）`;
						// f.dateTimePickerOptions.defaultDate = baseModel.end;
					}
					return f;
				});

				let targetModel = cloneDeep(baseModel);
				if (targetModel.actualStart) {
					targetModel.actualStart = moment(targetModel.actualStart).format(actualStartFormat);
				}
				if (targetModel.actualEnd) {
					targetModel.actualEnd = moment(targetModel.actualEnd).format(actualEndFormat);
				}
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
			, ...mapMutations("dailyPage", {
				select : SELECT
				, clearSelection : CLEAR_SELECT
			})
			, ...mapActions("dailyPage", {
				getAssignedInWeeklyTasks : "readGroups"
				, createWork : "createWork"
				, readWorks : "readWorks"
				, updateWork : "updateWork"
			})
			, ...mapActions("session", [
				"getSessionUser"
			])
			, assign(model) {
				this.createWork({ model, mutation: ADD });
			}
			, update(model) {
				this.updateWork({ model, mutation: UPDATE } );
			}
			, save(model) {
				this.clearSelection();
				this.updateWork( { model, mutation: UPDATE } );
			}
			, close(model) {
				this.clearSelection();
				model.status = -1;
				this.updateWork( { model, mutation: UPDATE } );
			}
			, remove(){ 
				// TODO:
				// this.deleteWork( { model: this.selected[0], mutation: REMOVE } );
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
			if (!this.currentWeek) {
				this.setCurrentWeek(moment().day(1).format("YYYY-MM-DD"));
			}

			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${SET_CURRENT_WEEK}`) {
					this.getAssignedInWeeklyTasks({
						options: { daily : this.currentWeek }
						, mutation: LOAD
					});

					if (this.me) {
						this.readWorks({
							options: { user : this.me.code, week : this.currentWeek }
							, mutation: LOAD_WORKS
						})
					}
				}
			});

            this.getAssignedInWeeklyTasks({
                options: { daily : this.currentWeek }
                , mutation: LOAD
			});

			if (this.me) {
				this.readWorks({
					options: { user : this.me.code, week : this.currentWeek }
					, mutation: `dailyPage/${LOAD_WORKS}`
				})
			} else {
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				this.$store.subscribe((mutation, state) => {
					if (mutation.type == `session/${SET_USER}`) {
						this.readWorks({ 
							options: { user : this.me.code, week : this.currentWeek }
							, mutation: `dailyPage/${LOAD_WORKS}`
						});
					}
				});				
			}
		}
	};
</script>