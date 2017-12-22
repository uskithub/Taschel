<template lang="pug">
	div
		schedule-page(:schema="schema", :tasks="assignedInWeeklyTasks", :works="works", :currentWeek="currentWeek")
		popup(:schema="popupSchema")
</template>

<script>
	import Vue from "vue";
    import SchedulePage from "../../core/DefaultSchedulePage.vue";
	import Popup from "../../core/components/popup";
	import schema from "./schema";
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
				, setCurrentWeek : SET_CURRENT_WEEK
				, showPopup : SHOW_POPUP
				, hidePopup : HIDE_POPUP
			})
			, ...mapActions("dailyPage", {
				getAssignedInWeeklyTasks : "readGroups"
				, assign : "createWork"
				, readWorks : "readWorks"
				, update : "updateWork"
			})
			, ...mapActions("session", [
				"getSessionUser"
			])
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
							, mutation: `dailyPage/${LOAD_WORKS}`
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