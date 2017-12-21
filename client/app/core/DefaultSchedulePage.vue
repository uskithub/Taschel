<template lang="pug">
	div.drag-container
		ul.drag-list
			li(class="drag-column drag-column-weekly-tasks", key="tasks")
				span.drag-column-header
					h2 {{ "tasks" }}
				div.drag-options
				ul.drag-inner-list(ref="tasks")
					li.drag-item(v-for="task in tasks", :data-code="task.code", :key="task.code")
						slot(:name="task.name")
							strong {{ task.name }}
							div {{ task.code }}
			li(class="drag-column", key="schedule")
				full-calendar(ref="calendar", :event-sources="eventSources", :options="schema.fullCalendar"
					@event-selected="eventSelected" 
					@event-created="eventCreated")
</template>

<script>
    import Vue from "vue";
    import Kanban from "./components/kanban";
    import FullCalendar from "./components/fullcalendar";

    import moment from "moment";

    export default {

        components: {
            Kanban
            , FullCalendar
        }
        , props: [
            "schema"
			, "tasks"
			, "bullets"
        ]
    
        , data() {
            return {
                events: [
                    {
                        id: 1,
                        title: 'event1',
                        start: moment().hours(12).minutes(0),
                    },
                    {
                        id: 2,
                        title: 'event2',
                        start: moment().add(-1, 'days'),
                        end: moment().add(1, 'days'),
                        allDay: true,
                    },
                    {
                        id: 3,
                        title: 'event3',
                        start: moment().add(2, 'days'),
                        end: moment().add(2, 'days').add(6, 'hours'),
                        allDay: false,
                    },
                ],

                config: {
                    eventClick: (event) => {
                        this.selected = event;
                    }
                },

                selected: {},
            };
        }

        , methods: {
            refreshEvents() {
                this.$refs.calendar.$emit('refetch-events');
            }

            , removeEvent() {
            this.$refs.calendar.$emit('remove-event', this.selected);
            this.selected = {};
            }

            , eventSelected(event) {
                this.selected = event;
            }

            , eventCreated(...test) {
                console.log(test);
            }
            , arrange(context) {
				this.$parent.arrange(context);
            }
        }

        , computed: {
            eventSources() {
                const self = this;
                return [
                    {
                        events(start, end, timezone, callback) {
                            setTimeout(() => {
                                callback(self.events.filter(() => Math.random() > 0.5));
                            }, 1000);
                        }
                    }       
                ];
            }
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
    	font-family: 'Lato';
    	font-weight: 300;
    	line-height: 1.5;
    	-webkit-font-smoothing: antialiased;
    }

    .drag-column {
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
			max-width: 400px;
			padding: 0.5em;
		}

	}
</style>
<style>
	@import "../../scss/fullcalendar.css";
	#app {
		font-family: "Avenir", Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}
</style>