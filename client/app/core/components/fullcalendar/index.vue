<template lang="pug">
    div
</template>

<script>
    import "fullcalendar"
    import "../../../../../node_modules/fullcalendar/dist/gcal"
    import $ from "jquery"

    export default {
        props: [
            "events"
            , "options"
            , "currentWeek"
        ]

        , computed: {
        }

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