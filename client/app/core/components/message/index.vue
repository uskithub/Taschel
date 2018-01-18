<template lang="pug">
    div
        .media
            .media-left
                img.avatar(:src="user.avatar")
            .media-content
                strong {{ user.username }}
                small.text-muted {{ dateText }}
                p {{ description }}
                .functions
                    a(href="#")
                        i.fa.fa-reply
                    a(href="#")
                        i.fa.fa-heart
                    a(href="#")
                        i.fa.fa-trash
        div(v-if="work")
            message(v-for="comment in work.comments", :key="comment.code", :comment="comment", :user="getUser(comment.author)")
</template>

<script>
    
    import moment from "moment";
    
	export default {
		name: "Message"
        , props: {
            work : {
				type: Object
				, validator: function(value) { return true; } // TODO
            }
			, comment : {
				type: Object
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
                const date = this.work ? moment(this.work.updatedAt) : moment(this.comment.updatedAt);
                if (date.isAfter(moment().add(-1, "d"))) {
                    return date.fromNow();
                } else {
                    return date.format("YYYY-MM-DD HH:mm");
                }
            }
            , description() {
                if (this.work) {
                    return this.work.description;
                } else {
                    return this.comment.description;
                }
            }
		}
		, methods : {
            
		}
	};
</script>

<style lang="scss" scoped>
</style>