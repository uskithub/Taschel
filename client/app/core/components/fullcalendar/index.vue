<template lang="pug">
    div
</template>

<script>
    import "fullcalendar"
    import $ from "jquery"

    export default {
        props: [
            "events"
            , "options"
        ]

        , computed: {

        }

        , watch: {
            events(newEvents) {
                // const event = newEvents[newEvents.length-1];
                // $(this.$el).fullCalendar("refetchEvents", event);
                
                const fc = $(this.$el);
                fc.fullCalendar("removeEventSources");
                fc.fullCalendar("addEventSource", { events : this.events });
                fc.fullCalendar("refetchEvents");
            }
        }

        , methods: {
            render() {
                this.options.eventSources = this.events;
                
                    
            }
        }
        
        , mounted() {
            const fc = $(this.$el);
            fc.fullCalendar(this.options);
            fc.fullCalendar("addEventSource", { events : this.events });
        }
    }
</script>
