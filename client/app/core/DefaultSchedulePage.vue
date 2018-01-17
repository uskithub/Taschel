<template lang="pug">
	.container
		h3.title {{ schema.title }}
		
		.content(v-if="isShowTips && schema.descriptions && schema.descriptions.length > 0")
			.media.primary
				.media-content
					strong このページの概要
					p
						ul
							li(v-for="line in schema.descriptions") {{ line }}
				.media-right
					a.close(title="Close" @click="off")
			br

		.flex.align-center.justify-space-around
			.left
				.form
					vue-form-generator(:schema="schema.userSelector", :model="modelUserSelector" ref="userSelector" @model-updated="selectUser")

		div.kanban-system-container
			ul.kanban-board-container
				li.kanban-board.kanban-board-weekly-tasks(key="weekly")
					span.kanban-board-header
						legend {{ _("Tasks") }}
					div.drag-options
					ul.kanban-list(data-code="weekly" ref="tasks")
						kanban(v-for="task in tasks", :task="task", :key="task.code")
						//- li.kanban-item.card(v-for="task in tasks", :class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" ref="items" data-duration="1:00")
						//- 	slot(:name="task.name")
						//- 		strong {{ task.name }}
						//- 		.text-muted
						//- 			dl(v-for="item in description(task)", :key="item.key")
						//- 				dt {{ item.title }}
						//- 				dd {{ item.value }}
				li.kanban-board(key="schedule")
					full-calendar(:events="events", :options="schema.fullCalendar", :currentWeek="currentWeek")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			@save="save"
			@close="close"
			@remove="remove"
			@cancel="cancel"
		)
		review(v-if="reviewingDay", :schema="schema.reviewForm", :works="worksOfReviewingDay", :template="reviewModel"
			@save="save"
			@close="close"
			@remove="remove"
			@cancel="cancel"
		)
</template>

<script>
    import Vue from "vue";
	import FullCalendar from "./components/fullcalendar";
	import Kanban from "./components/kanban/kanban.vue";
	import PopupForm from "./components/popupform";
	import Review from "./components/review";

	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	import { cloneDeep } from "lodash";
	import moment from "moment";
	
	let previousBoardCode = null;
	let drake = null;

	// finding the task object has the code from the objects in the array.
	// recursivly finding its children.
	const findTask = (code, array) => {
		for (let i in array) {
			let t = array[i];
			if (t.code == code) {
				return t;
			} else if (t.children.length > 0) {
				let result = findTask(code, t.children);
				if (result) {
					return result;
				}
			}
		}
		return null;
	};

    export default {
        name: "SchedulePage"
        , components: {
			FullCalendar
			, Kanban
			, PopupForm
			, Review
		}
		, props: {
			schema : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, tasks : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, works : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, reviews : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, selected : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, reviewingDay : {
				type: String
				, validator: function(value) { return true; } // TODO
			}
			, currentWeek : {
				type: String
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, currentUser : {
				type: String 
			}
			, model : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
			, reviewModel : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
		}
        , data() {
            return {
				isShowTips : true
				// 選択したユーザが格納される
				, modelUserSelector: {
					author : this.currentUser
				}
			};
        }

        , computed: {
			options() { 
				if (this.schema.popupForm) {
					return this.schema.popupForm.options || {}; 
				} else {
					return {};
				}
			}
			, isAddButtonEnable() { return this.options.isAddButtonEnable !== false; }
			, isEditing() { return this.model != null || this.selected.length > 0; }
			, worksOfReviewingDay() {
				if (this.reviewingDay == null) {
					return [];
				}
				return this.works.filter(w => {
					return moment(w.start).format("DD") == this.reviewingDay 
						&& w.status < 0;
				});
			 }
			, events() {
				const closedEventColor = this.schema.fullCalendar.closedEventColor;
				let _works = cloneDeep(this.works);

				// the first day of currentWeek(mon), tue, wed, thu, fri 
				let days = [0, 1, 2, 3].reduce((arr, i) => {
					arr.push(moment(arr[i]).add(1, "d").format());
					return arr;
				}, [this.currentWeek]);

				// TODO
				// closeしたworkが件の場合にはeditableをfalseにする
				let _reviews = days.map(d => {
					const r = this.reviews.filter(r => { 
						return r.date == d; });
					if (r.length > 0) {
						return {
							title: "済"
							, allDay: true
							, start: d
							, editable: false
							, color: closedEventColor.color
						};
					}
					return {
						title: "未"
						, allDay: true
						, start: d
						, editable: false
					};
				});	
				
				_works.forEach( work => {
					if (work.status < 0) {
						work.color = closedEventColor.color;
						work.textColor = closedEventColor.textColor;
					}
				});
				return _reviews.concat(_works);
			}
		}
		, watch: {
			currentUser(newVal) {
				this.modelUserSelector.author = newVal;
			}
			/*
			model: {
				handler: function(newVal, oldVal) {
					if (newVal === oldVal) // call only if a property changed, not the model
						console.log("Model property changed!");
				},
				deep: true
			}*/
		}
		, methods: {
			description(task) {
				return [
					{
						key: "purpose"
						, title: _("Purpose")
						, value: task.purpose
					}
					, {
						key: "goal"
						, title: _("Goal")
						, value: task.goal
					}
				];
			}
			, off() { this.isShowTips = false; }
            , selectUser(newVal, schema) { 
				// if (newVal !== undefined) {
					// When user reloaded the page by F5, model-update would be called with undefined.
					// Otherwise user selected nothing-selected, model-update would be called with null.
					this.$emit("selectUser", newVal);
				// }
			}
			, makeDraggable() {
				const kanbanItems = Array.from(document.querySelectorAll(".kanban-item"), el => { 
					el.dataset.duration = "1:00";
					return el; 
				});
				if (kanbanItems.length == 0) {
					return;
				}
				kanbanItems.forEach( t => {
					$(t).draggable({
						zIndex: 999
						, containment: ".kanban-system-container"
						, revert: true      // immediately snap back to original position
						, revertDuration: 0  //
						, start: function() {
							// $(this).addClass("is-moving");
						}
						, drag: function() {}
						, stop: function() {
							// $(this).removeClass("is-moving");
						}
					});
				});
			}
			, save(model) { this.$emit("save", model); }
			, close(model) { this.$emit("close", model); }
			, remove() { this.$emit("remove"); }		// deleteは予約語なので怒られる
			, cancel() { this.$emit("cancel"); }
		}
		, created() {
			// TODO: closeされているworkは色を変える
			// TODO: closeされているworkは動かせなくする
			this.schema.fullCalendar.drop = (date, jqEvent, ui, resourceId) => {
				// ignore dropped at all-day slot.
				if (!date.hasTime()) { return; }

				const code = $(jqEvent.target).data("code");
				const task = findTask(code, this.tasks);
				const newModel = {
					title : task.name
					, start : date.utc().format()
					, end : date.add(1, "h").utc().format()
					, parent_code : task.code
					, week : this.currentWeek
				};
				this.$emit("assign", newModel);
			};

			// for user's dragging and dropping events
			this.schema.fullCalendar.eventDrop = (event, delta, revertFunc, jqEvent, ui, view) => {
				for (let i in this.works) {
					let work = this.works[i];
					if (work.code == event.code) {
						work.start = moment(event.start).format();
						work.end = moment(event.end).format();
						this.$emit("update", work);
						return;
					}
				}
			};

			// for user's expanding events.
			this.schema.fullCalendar.eventResize = (event, delta, revertFunc, jqEvent, ui, view) => {
				for (let i in this.works) {
					let work = this.works[i];
					if (work.code == event.code) {
						work.end = moment(event.end).format();
						this.$emit("update", work);
						return;
					}
				}
			};

			// for user's editing with popupForm
			this.schema.fullCalendar.eventClick = (event, jqEvent, view) => {

				if (event.allDay) {
					const day = event.start.format("DD");
					this.$emit("selectReviewDay", day);

				} else {
					for (let i in this.works) {
						let work = this.works[i];
						if (work.code == event.code) {
							this.$emit("select", work);
							return;
						}
					}
				}

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			};

			this.schema.fullCalendar.viewRender = (view, elem) => {
				this.$emit("setCurrentWeek", view.start.format("YYYY-MM-DD"));
			};
		}
		, updated() {
			this.$nextTick(function () {
				this.makeDraggable();
			});
		}
		, mounted() {
			this.$nextTick(function () {
				this.makeDraggable();
			});
		}
    };
</script>

<style lang="scss">
	// @see http://makotottn.hatenablog.com/entry/2017/08/29/004422
	@import "../../../node_modules/fullcalendar/dist/fullcalendar.css";
    @import "../../scss/common/mixins";
	@import "../../scss/taschel/kanban";

	#app {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		margin-top: 60px;
	}

	.kanban-board-container {
		.kanban-board {
			overflow: visible;
			
			&.kanban-board-weekly-tasks {
				flex: 0.3;
			}
		}
	}

    .section {
    	padding: 20px;
    	text-align: center;

    	a {
    		color: white;
    		text-decoration: none;
    		font-weight: 300;
    	}

    	h4 {
    		font-weight: 400;
    		a {
    			font-weight: 600;
    		}
    	}
    }

	.container {
		padding: 1rem;
	}

	.form {
		margin: 1rem 0;

		@include bgTranslucentDark(0.2);
		border-radius: 8px;

		.buttons {
			padding: 0.5em;
		}
	}

	hr { 
        width: 100%; 
	}
	
</style>