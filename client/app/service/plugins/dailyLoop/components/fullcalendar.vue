<template lang="pug"></template>

<script>
    import "fullcalendar";
    import $ from "jquery";

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
                console.log("● newWeek", newWeek);
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

<style src="fullcalendar/dist/fullcalendar.css"></style>