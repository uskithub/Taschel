<template lang="pug">
	.media
		.media-left
			img.avatar(:src="user.avatar")
		.media-content
			strong {{ user.username }}
			small.text-muted {{ dateText }}
			p {{ comment.description }}
			.functions
				a(href="#")
					i.fa.fa-reply
				a(href="#")
					i.fa.fa-heart
				a(href="#")
					i.fa.fa-trash
</template>

<script>
    
    import moment from "moment";
    
	export default {
		name: "Message"
        , props: {
			comment : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
            }
            , user : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
        }
		, computed: {
            dateText() {
                const date = moment(this.comment.updatedAt);
                if (date.isAfter(moment().add(-1, "d"))) {
                    return date.fromNow();
                } else {
                    return date.format("YYYY-MM-DD HH:mm");
                }
            }
		}
		, methods : {

		}
	};
</script>

<style lang="scss" scoped>
</style>