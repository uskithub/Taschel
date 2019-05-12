<template lang="pug"></template>
<script>
    import $ from "jquery";
    import "fullcalendar";

    export default {
        name: "Fullcalendar"
        , props: [
            "events"
            , "options"
            , "currentWeek"
        ]
        , watch: {
            events(newEvents) {
                const fc = $(this.$el);
                fc.fullCalendar("removeEventSources");
                fc.fullCalendar("addEventSource", { events : this.events });
                fc.fullCalendar("refetchEvents");
            }
            , currentWeek(newWeek) {
                const fc = $(this.$el);
                fc.fullCalendar("gotoDate", newWeek);
            }
        }
        , methods: {
        }
        , mounted() {
            const fc = $(this.$el);
            fc.fullCalendar(this.options);
            fc.fullCalendar("addEventSource", { events : this.events });
            fc.fullCalendar("gotoDate", this.currentWeek);
        }
    }
</script>
<style>
    @import "fullcalendar/dist/fullcalendar.css";
	
    /* .fc-divider.fc-widget-header { 
        width: 100%; 
	} */
</style>