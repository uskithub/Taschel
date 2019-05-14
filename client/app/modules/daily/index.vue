<template lang="pug">
	schedule-page(:schema="schema", :selected="selected", :reviewingDayOfWeek="reviewingDayOfWeek", :currentUser="currentUser", :users="users", :tasks="populatedTasks", :works="works", :reviews="reviews", :currentWeek="currentWeek", :model="model", :reviewModel="reviewModel"
		@assign="assign"
		@selectUser="selectUser"
		@select="select"
		@update="update"
		@setCurrentWeek="setCurrentWeek"
		@save="save"
		@close="close"
		@remove="remove"
		@cancel="cancel"
		@selectReviewDayOfWeek="selectReviewDayOfWeek"
	)
</template>

<script>
	import Vue from "vue";
	import SharedMixin from "../common/mixins/Shared.vue"
    import SchedulePage from "../../core/DefaultSchedulePage.vue";
	import schema from "./schema";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isArray, isObject } from "lodash";

	import toast from "../../core/toastr";
	import moment from "moment";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_CURRENT_WEEK, LOAD_USERS, SELECT_USER, SET_USER, LOAD, LOAD_WORKS, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SHOW_POPUP, HIDE_POPUP, SELECT_DAY_OF_WEEK, LOAD_REVIEWS, ADD_REVIEW, UPDATE_TASK } from "../common/constants/mutationTypes";

	// determine whether model is review model or not.
	// return "highOrderReview", "reviewOfWorks", "works"
	const determineModel = (model) => {
		if (model.highOrderAwakening) {
			return "highOrderReview";
		}
		for (let i in schema.reviewForm.form.groups[0].fields) {
			const f = schema.reviewForm.form.groups[0].fields[i];
			if (model[f.model]) return "reviewOfWorks";
		}
		return false;
	};

    // @see: https://github.com/vue-generators/vue-form-generator
	export default {
		mixins : [ SharedMixin ]
		, components: {
            SchedulePage
		}
		, computed: {
			...mapGetters("dailyPage", [
				"assignedInWeeklyTasks"
				, "works"
				, "reviews"
				, "selected"
				, "reviewingDayOfWeek"
			])
			, populatedTasks() {
				return this.assignedInWeeklyTasks.map(t => {
					return this.populateRoot(t);
				});
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
				, reviewModel: null
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
				this.schema.popupForm.title = `${baseModel.title} を編集`;

				let actualStartFormat, actualEndFormat;
				this.schema.popupForm.form.groups[1].fields.forEach(f => {
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
			// notice this func is also called when reviewingDay became null.
			, reviewingDayOfWeek(dayOfWeek) {
				if (dayOfWeek == null) {
					this.reviewModel = null;
					return;
				}
				
				const reviewingDate = moment(this.currentWeek).day(dayOfWeek).format("YYYY-MM-DD");
				this.schema.reviewForm.title = `${reviewingDate} の振り返り`;

				const worksOfReviewingDate = this.works.filter(w => {
					return moment(w.start).day() == dayOfWeek && w.status < 0;
				});

				let model = {
					highOrderReview : schemaUtils.createDefaultObject(this.schema.reviewForm.form.groups[1])
					, reviewOfWorks: new Array(worksOfReviewingDate.length)
				};

				for (let i in this.reviews) {
					let review = this.reviews[i];
					if (review.date == reviewingDate) {
						model.highOrderReview = cloneDeep(review);
						break;
					}
				}
				model.highOrderReview.week = this.currentWeek;
				model.highOrderReview.date = reviewingDate;
				model.highOrderReview.works = worksOfReviewingDate.map(w => { return w.code; });

				for (let i=0; i<worksOfReviewingDate.length; i++) {
					model.reviewOfWorks[i] = schemaUtils.createDefaultObject(this.schema.reviewForm.form.groups[0]);
					model.reviewOfWorks[i].code = worksOfReviewingDate[i].code;
					model.reviewOfWorks[i].goodSide = worksOfReviewingDate[i].goodSide;
					model.reviewOfWorks[i].badSide = worksOfReviewingDate[i].badSide;
					model.reviewOfWorks[i].improvement = worksOfReviewingDate[i].improvement;
				}
				this.reviewModel = model;
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
			...mapMutations("dailyPage", {
				select : SELECT
				, clearSelection : CLEAR_SELECT
				, selectReviewDayOfWeek : SELECT_DAY_OF_WEEK
			})
			, ...mapActions("dailyPage", {
				getAssignedInWeeklyTasks : "readGroups"
				, createWork : "createWork"
				, readWorks : "readWorks"
				, updateWork : "updateWork"
				, deleteWork : "deleteWork"
				, createReview : "createReview"
				, readReviews : "readReviews"
				, updateReview : "updateReview"
				, getUsers : "readUsers"
				, updateTask : "updateTask"
			})
			, selectUser(code) { 
				this.setCurrentUser(code); 
				if (code) {
					this.getAssignedInWeeklyTasks({
						options: { user_code : code, daily : this.currentWeek }
						, mutation: LOAD
					});

					this.readWorks({
						options: { user_code : code, week : this.currentWeek }
						, mutation: LOAD_WORKS
					});
					this.readReviews({
						options: { user_code : code, week : this.currentWeek }
						, mutation: LOAD_REVIEWS
					});
				}
			}
			, assign(model) {
				this.createWork({ model, mutation: ADD });
			}
			, update(model) {
				this.updateWork({ model, mutation: UPDATE } );
			}
			, save(model) {
				const modelType = determineModel(model);
				if (modelType == "highOrderReview") {
					this.createReview( { model, mutation: ADD_REVIEW } );
					this.selectReviewDayOfWeek(null);
				} else {
					this.clearSelection();
					this.updateWork( { model, mutation: UPDATE } );
				}
			}
			, close(model, taskModel) {
				this.clearSelection();
				model.status = -1;
				this.updateWork( { model, mutation: UPDATE } )
				.then(() => {
					if (taskModel !== null && taskModel !== undefined ) {
						taskModel.status = -1;
						this.updateTask( { model: taskModel, mutation: UPDATE_TASK } );
					}
				});
			}
			, remove(){ 
				this.deleteWork( { model: this.selected[0], mutation: REMOVE } );
				this.clearSelection();
			}
			, cancel() {
				if (this.model) {
					this.clearSelection();
					this.model = null;
				} else {
					this.selectReviewDayOfWeek(null);
				}
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${SET_CURRENT_WEEK}` && this.currentUser) {
					this.getAssignedInWeeklyTasks({
						options: { user_code : this.currentUser, daily : this.currentWeek }
						, mutation: LOAD
					});

					this.readWorks({
						options: { user_code : this.currentUser, week : this.currentWeek }
						, mutation: LOAD_WORKS
					});

					this.readReviews({
						options: { user_code : this.currentUser, week : this.currentWeek }
						, mutation: LOAD_REVIEWS
					});
				}
			});

			if (!this.currentUser) {
				if (this.me) {
					this.setCurrentUser(this.me.code);

					this.getAssignedInWeeklyTasks({
						options: { daily : this.currentWeek }
						, mutation: LOAD
					});

					this.readWorks({
						options: { user_code : this.me.code, week : this.currentWeek }
						, mutation: `dailyPage/${LOAD_WORKS}`
					})

					this.readReviews({
						options: { user_code : this.me.code, week : this.currentWeek }
						, mutation: LOAD_REVIEWS
					});
				} else {
					// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
					this.$store.subscribe((mutation, state) => {
						if (mutation.type == `session/${SET_USER}`) {
							this.setCurrentUser(this.me.code);

							this.getAssignedInWeeklyTasks({
								options: { user_code : this.me.code, daily : this.currentWeek }
								, mutation: LOAD
							});

							this.readWorks({ 
								options: { user_code : this.me.code, week : this.currentWeek }
								, mutation: `dailyPage/${LOAD_WORKS}`
							});

							this.readReviews({
								options: { user_code : this.me.code, week : this.currentWeek }
								, mutation: LOAD_REVIEWS
							});
						}
					});	
				}
			} else {
				this.getAssignedInWeeklyTasks({
					options: { user_code : this.currentUser, daily : this.currentWeek }
					, mutation: LOAD
				});

				this.readWorks({
					options: { user_code : this.currentUser, week : this.currentWeek }
					, mutation: `dailyPage/${LOAD_WORKS}`
				})

				this.readReviews({
					options: { user_code : this.currentUser, week : this.currentWeek }
					, mutation: LOAD_REVIEWS
				});
			}
		}
	};
</script>