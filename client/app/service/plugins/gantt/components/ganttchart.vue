<template lang="pug"></template>

<script>
    import $ from "jquery";
    import "fullcalendar";
    import "fullcalendar-scheduler";

    export default {
        name: "Ganttchart"
        , props: [
            "options"
            , "currentWeek"
        ]
        , watch: {
            options(options) {
                const fc = $(this.$el);
                fc.fullCalendar(this.options);
                fc.fullCalendar("refetchResources");
            }
            , currentWeek(newWeek) {
                const fc = $(this.$el);
                // fc.fullCalendar("gotoDate", newWeek);
            }
        }
        , methods: {
        }
        , mounted() {
            const fc = $(this.$el);
            fc.fullCalendar(this.options);
            // fc.fullCalendar("gotoDate", this.currentWeek);
        }
    }
</script>
<style>
    @import "fullcalendar/dist/fullcalendar.css";
    @import "fullcalendar-scheduler/dist/scheduler.css";
</style>