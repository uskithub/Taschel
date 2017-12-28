<template lang="pug">
	.container
		div.drag-container
			ul.drag-list
				li(class="drag-column drag-column-weekly-tasks", key="weekly")
					span.drag-column-header
						h2 {{ "tasks" }}
					div.drag-options
					ul.drag-inner-list(data-code="weekly" ref="tasks")
						li.drag-item(v-for="task in tasks", :data-code="task.code", :key="task.code" ref="items" data-duration="1:00")
							slot(:name="task.name")
								strong {{ task.name }}
								div {{ task.code }}
				li(class="drag-column", key="schedule")
					full-calendar(:events="works", :options="schema.fullCalendar", :currentWeek="currentWeek")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			, @save="save"
			, @remove="remove"
			, @cancel="cancel"
		)
</template>

<script>
    import Vue from "vue";
	import FullCalendar from "./components/fullcalendar";
	import PopupForm from "./components/popupform";

	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	import moment from "moment";
	
	let previousBoardCode = null;
	let drake = null;

    export default {

        components: {
            FullCalendar
			, PopupForm
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
			, selected : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, currentWeek : {
				type: String
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, model : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
		}
        , data() {
            return {
				events : this.works
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
		}
		, methods: {
			makeDraggable() {
				if (!this.$refs.items) {
					return;
				}
				this.$refs.items.forEach( t => {
					$(t).draggable({
						zIndex: 999
						, containment: ".drag-container"
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
			, remove() { this.$emit("remove"); }		// deleteは予約語なので怒られる
			, cancel() { this.$emit("cancel"); }
		}
		, created() {
			this.schema.fullCalendar.drop = (date, jqEvent, ui, resourceId) => {
				const code = $(jqEvent.target).data("code");
				const task = this.tasks.filter(t => { return t.code == code; })[0];
				const newModel = {
					title : task.name
					, start : `${date.format()}Z`
					, end : `${date.add(1, "h").format()}Z`
					, parent_code : task.code
					, week : this.currentWeek
				};
				this.$emit("assign", newModel);
			};

			this.schema.fullCalendar.eventDrop = (event, delta, revertFunc, jqEvent, ui, view) => {
				const diff = {
					code: event.code
					, start : moment(event.start).format()
				};
				this.$emit("update", diff);
			};

			this.schema.fullCalendar.eventResize = (event, delta, revertFunc, jqEvent, ui, view) => {
				const diff = {
					code: event.code
					, end : moment(event.end).format()
				};
				this.$emit("update", diff);
			};

			this.schema.fullCalendar.eventClick = (event, jqEvent, view) => {
				console.log("●", event);

				this.$emit("select", event);

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			};

			this.schema.fullCalendar.viewRender = (view, elem) => {
				this.$emit("set-current-week", view.start.format("YYYY-MM-DD"));
			};
		}
		, updated() {
			this.makeDraggable();
		}
		, mounted() {
			this.makeDraggable();
		}
    };
</script>

<style lang="scss">
    @import "../../scss/common/mixins";
	@import "../../scss/kanban.scss";
	$on-hold: #FB7D44;
    $in-progress: #2A92BF;
    $needs-review: #F4CE46;
    $approved: #00B961;

    * {
    	box-sizing: border-box;
    }

    body {
    	background: #33363D;
    	color: white;
    	font-family: "Lato";
    	font-weight: 300;
    	line-height: 1.5;
    	-webkit-font-smoothing: antialiased;
    }

    .drag-column {
		overflow: visible;
		
        &-weekly-tasks {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $on-hold;
			}
			flex: 0.3;
        }

        &-in-progress {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $in-progress;
            }
        }

        &-needs-review {
            .drag-column-header,
            .is-moved,
            .drag-options{
                background: $needs-review;
            }
        }

        &-approved {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $approved;
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
</style>
<style>
	/* http://makotottn.hatenablog.com/entry/2017/08/29/004422 */
	@import "../../../node_modules/fullcalendar/dist/fullcalendar.css";
	#app {
		font-family: "Avenir", Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}
</style>