<template lang="pug">
	.container
		h3.title {{ schema.title }}




</template>
<script>
    import Vue from "vue";
    import SharedMixin from "../common/mixins/Shared.vue"
    import schema from "./schema";

    import moment from "moment";

    import { mapGetters, mapMutations, mapActions } from "vuex";
    import { SET_REVIEWING_DAY, LOAD_WORKS} from "../common/constants/mutationTypes";
    
	export default {
        name: "DailyReviewPage"
        , mixins : [ SharedMixin ]
        , components: {
		}
		, computed: {
			...mapGetters("dailyReviewPage", [
				"reviewingDay"
            ])
			
        }	
        , data() {
			return {
				schema
			};
		}
		, watch: {
            users(newUsers) {
                console.log("● [watch for users] newValue:", newUsers);
                this.setup();
            }
			, reviewingDay(newDay) {
                console.log("● [watch for reviewingDay] newValue:", newDay);
            }
            , works(newWorks) {
                console.log("● [watch for works] newValue:", newWorks);
            }
		}
		, methods: {
            ...mapMutations("dailyReviewPage", {
                setReviewingDay : SET_REVIEWING_DAY
            })
			, ...mapActions("dailyReviewPage", {
				readWorks : "readWorks"
                // , readReviews : "readReviews"
			})
			, setup() {
                console.log("● [method:setup]");
                this.readWorks({ 
                    options: { date : this.reviewingDay }
                    , mutation: LOAD_WORKS 
                });
                // this.readReviews();
            }
		}
        , created() {
            const yesterday = moment().add(-1, "d").format("YYYY-MM-DD");
            this.setReviewingDay(yesterday);

            if (this.user && this.user.length > 0) {
                this.setup();
            }
		}
	};

</script>

<style lang="scss" scoped>
    @import "../../../scss/common/mixins"; 
</style>
