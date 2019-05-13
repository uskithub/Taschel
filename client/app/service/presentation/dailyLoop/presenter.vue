<template lang="pug">
	.container
		daily-loop-editing-view(v-if="isEditing", :entity="workEntity", :schema="formSchemaEditing"
			@endEditing="onEndEditing"
			@save="onSave"
			@close="onClose"
		)
		daily-loop-reviewing-view(v-else-if="isReviewing", :date="reviewingDate", :entity="reviewEntity", :reviewingWorks="reviewingWorks", :schema="formSchemaReviewing"
			@endReviewing="onEndReviewing"
			@save="onSave" 
			@review="onReview"
		)
		daily-loop-view(v-else, :schema="fullcalendarSchema")
</template>

<script>
	import Vue from "vue";
	import AbstractPresenter from "system/mixins/abstractPresenter";
	import DailyLoopView from "./view"
	import DailyLoopEditingView from "./editingView"
	import DailyLoopReviewingView from "./reviewingView"

	import Work from "service/domain/entities/work";
	import Review from "service/domain/entities/review";
	
	import { mapGetters, mapActions } from "vuex";

    import { 
		操作対象の週を変更する
		, 自分のその週のタスク一覧を取得する
		, 自分のその週のワーク一覧を取得する
		, 自分のその週のレビュー一覧を取得する
		, ワークを追加する
		, ワークを編集する
		, ワークをクローズする
		, 日次レビューする
		, レビューを編集する
		, タスクをクローズする
	} from "service/application/usecases";

	import schema from "./schema";
	import moment from "moment";

	const _ = Vue.prototype._;

	// finding the task object has the code from the objects in the array.
	// recursivly finding its children.
	const findTask = (code, taskArr) => {
		for (let i in taskArr) {
			let t = taskArr[i];
			if (t.code === code) {
				return t;
			} else if (t.tasks.length > 0) {
				let result = findTask(code, t.tasks);
				if (result) {
					return result;
				}
			}
		}
		return null;
	};

	schema.formEditing.groups = Work.createFormSchema(schema.formEditing.groups);
	schema.formReviewing.groups = Review.createFormSchema(schema.formReviewing.groups);

	export default {
		name : "DailyLoop"
		, mixins : [ AbstractPresenter ]
		, components : {
			DailyLoopView
			, DailyLoopEditingView
			, DailyLoopReviewingView
		}
		, computed : {
			...mapGetters([
				"currentWeek"
				, "currentWeekOfMonth"
				, "currentweekTaskGroup"
				, "currentWeekWorks"
				, "currentWeekReviews"
			])
		}
		, data() {
			schema.fullCalendar.drop = this.didDropTask;
			schema.fullCalendar.eventDrop = this.didRelocateEvent;
			schema.fullCalendar.eventResize = this.didResizeEvent;
			schema.fullCalendar.eventClick = this.didClickEvent;
			schema.fullCalendar.viewRender = this.didChangeWeek;

			return {
				isEditing: false
				, isReviewing: false
				, workEntity: null
				, reviewingDate: null
				, reviewEntity: null
				, reviewingWorks: null
				, formSchemaEditing : schema.formEditing
				, formSchemaReviewing : schema.formReviewing
				, fullcalendarSchema: schema.fullCalendar
			};
		}
		, methods : {
			...mapActions([
				操作対象の週を変更する
				, 自分のその週のタスク一覧を取得する
				, 自分のその週のワーク一覧を取得する
				, 自分のその週のレビュー一覧を取得する
				, ワークを追加する
				, ワークを編集する
				, ワークをクローズする
				, 日次レビューする
				, レビューを編集する
				, タスクをクローズする
			])
			// Interfacial operations
			, didDropTask(date, jqEvent, ui, resourceId) {
				console.log("drop");
				// ignore dropped at all-day slot.
				if (!date.hasTime()) { return; }

				const code = $(jqEvent.target).data("id");
				const task = findTask(code, this.currentweekTaskGroup.tasks);
				const work = {
					title: task.name
					, start: date.utc().format()
					, end: date.add(1, "h").utc().format()
					, parent_code: task.code
					, week: this.currentWeek.format("YYYY-MM-DD")
					, author: this.me.code
				};
				this.ワークを追加する(work);
			}
			, didRelocateEvent(event, delta, revertFunc, jqEvent, ui, view) {
				const code = event.id;
				const start = moment(event.start).format();
				const end = moment(event.end).format();
				console.log("eventDrop", code, start, end);
				this.ワークを編集する({ code, start, end });
			}
			, didResizeEvent(event, delta, revertFunc, jqEvent, ui, view) {
				const code = event.id;
				const end = moment(event.end).format();
				console.log("eventResize");
				this.ワークを編集する({ code, end });
			}
			, didClickEvent(event, jqEvent, view) {
				console.log("呼ばrているのか", event);
				if (event.id === "GOOGLE_CALENDAR") return;
				if (event.allDay) {
					this.reviewingDate = moment(event.start);
					const dayOfWeek = event.start.day();
					let review = this.currentWeekReviews.find(r => r.code == event.id);
					this.reviewEntity = review ? review : null;
					
					this.reviewingWorks = this.currentWeekWorks.filter(w => {
						return moment(w.start).day() === dayOfWeek && w.status < 0;
					});
					this.isReviewing = true;

				} else {
					for (let i in this.currentWeekWorks) {
						let work = this.currentWeekWorks[i];
						if (work.code == event.id) {
							this.workEntity = work;
							this.isEditing = true;
							return;
						}
					}
				}
			}
			// 実際にはediting/reviewingから戻ってきた時の再描画でもviewRenderが呼ばれるので走っている
			, didChangeWeek(view, elem) {
				if (!this.isReady) return;

				this.操作対象の週を変更する(view.start)
					.then(() => {
						this.popCrumb();
						this.pushCrumb({ id: "week", name: this.currentWeekOfMonth });
						this.自分のその週のタスク一覧を取得する();
						this.自分のその週のワーク一覧を取得する();
						this.自分のその週のレビュー一覧を取得する();
					});
			}
			, onEndEditing() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.workEntity = null;
				});
			}
			, onSave(data) {
				return Promise.resolve().then(() => {
					return this.ワークを編集する(data);
				}).then(() => {
					this.onEndEditing();
				});
			}
			, onClose(data, withTask) {
				return Promise.resolve().then(() => {
					return this.ワークをクローズする(data);
				}).then(() => {
					if (withTask) {
						const task = findTask(data.parent, this.currentweekTaskGroup.tasks);
						this.タスクをクローズする(task.rawValues);
					}
				}).then(() => {
					this.onEndEditing();
				});
			}
			, onEndReviewing() {
				this.isReviewing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.reviewingDate = null;
					this.reivewEntity = null;
					this.reviewingWorks = null;
				});
			}
			, onReview(data) {
				return Promise.resolve().then(() => {
					if (this.reviewEntity) {
						// update
						return this.レビューを編集する(data);
					} else {
						// create
						return this.日次レビューする(data);
					}
				}).then(() => {
					this.onEndReviewing();
				});
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("DailyLoop") });
			this.pushCrumb({ id: "week", name: this.currentWeekOfMonth });
		}
		, sessionEnsured(me) {
			this.自分のその週のタスク一覧を取得する();
			this.自分のその週のワーク一覧を取得する();
			this.自分のその週のレビュー一覧を取得する();
		}
	};
</script>