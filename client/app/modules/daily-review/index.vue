<template lang="pug">
	.container
		h3.title {{ schema.title }}
		.flex.align-center.justify-space-around
			.right(v-if="reviewingDay")
				button.button.is-primary(@click="buttonPrevDidPush")
					i.icon.fa.fa-arrow-left
				.tag.primary {{ reviewingDay }}
				button.button.is-primary(@click="buttonNextDidPush")
					i.icon.fa.fa-arrow-right
		.kanban-system-container
			ul.kanban-board-container.content.card-columns
				li.kanban-board(v-for="_reviews in dailyReviews", :key="_reviews.user.code")
					span.kanban-board-header
						legend {{ _reviews.user.username }}
					ul.kanban-list
						li.kanban-item.card(key="_reviews.review.code" @click="comment($event, 'review', _reviews.review.code)") 
							slot(name="HighOrderAwakening")
								strong {{ _("HighOrderAwakening") }}
							.text-muted {{ _reviews.review.highOrderAwakening }}
						li.kanban-item.card(v-for="work in _reviews.works", :key="work.code"  @click="comment($event, 'work', work.code)")
							slot(:name="work.title")
								strong {{ work.title }}
								.text-muted
									dl(v-for="item in description(work)", :key="item.key")
										dt {{ item.title }}
										dd {{ item.value }}
		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			@save="save"
			@cancel="cancel"
		)
					
</template>
<script>
    import Vue from "vue";
	import SharedMixin from "../common/mixins/Shared.vue"
	import PopupForm from "../../core/components/popupform";
    import schema from "./schema";

    import moment from "moment";

    import { mapGetters, mapMutations, mapActions } from "vuex";
    import { SET_REVIEWING_DAY, LOAD_WORKS, LOAD_REVIEWS} from "../common/constants/mutationTypes";
	
	const yesterday = moment().add(-1, "d");

	export default {
        name: "DailyReviewPage"
        , mixins : [ SharedMixin ]
        , components: {
			PopupForm
		}
		, computed: {
			...mapGetters("dailyReviewPage", [
                "reviewingDay"
                , "works"
                , "reviews"
            ])
            , dailyReviews() {
                return this.reviews.reduce((result, review) => {
					const _user = this.users.filter(u => { return u.code == review.author; });
					if (_user.length == 0) {
						return result;
					}
					const _works = this.works.filter(w => { return w.author == review.author; });
                    result.push({
						user: _user[0]
						, review: review
                        , works: _works
                    });
                    return result;
                }, []);
			}
			, isEditing() { return this.model != null }
        }	
        , data() {
			return {
				schema
				, model : null
			};
		}
		, watch: {
            users(newUsers) {
                console.log("● [watch for users] newValue:", newUsers);
                this.setup();
            }
			, reviewingDay(newDay) {
				console.log("● [watch for reviewingDay] newValue:", newDay);
				this.setup();
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
                , readReviews : "readReviews"
			})
			, setup() {
                console.log("● [method:setup]");
                this.readWorks({ 
                    options: { date : this.reviewingDay }
                    , mutation: LOAD_WORKS 
                });
                this.readReviews({ 
                    options: { date : this.reviewingDay }
                    , mutation: LOAD_REVIEWS 
                });
			}
			, description(work) {
				let result = [
					{
						key: "description"
						, title: _("Description")
						, value: work.description
					}
				];
				if (work.goodSide) { 
					result.push({
						key: "goodSide"
						, title: _("GoodSide")
						, value: work.goodSide
					});	
				}
				if (work.badSide) {
					result.push({
						key: "badSide"
						, title: _("BadSide")
						, value: work.badSide
					});
				}
				if (work.improvement) {
					result.push({
						key: "improvement"
						, title: _("Improvement")
						, value: work.improvement
					});
				}
				return result;
			}
			, buttonPrevDidPush() {
				const newCurrent = moment(this.reviewingDay).add(-1, "d");
				this.setReviewingDay(newCurrent.format("YYYY-MM-DD"));
			}
			, buttonNextDidPush() {
				const newCurrent = moment(this.reviewingDay).add(1, "d");
				if (newCurrent.isAfter(yesterday)) {
					this.setReviewingDay(yesterday.format("YYYY-MM-DD"));
				} else {
					this.setReviewingDay(newCurrent.format("YYYY-MM-DD"));
				}
			}
			, comment(event, type, code) {
				console.log(`● type: ${type}, code: ${code}`);
				this.model = {};
			}
			, cancel() { this.model = null; }
		}
        , created() {
            this.setReviewingDay(yesterday.format("YYYY-MM-DD"));

            if (this.user && this.user.length > 0) {
                this.setup();
            }
		}
	};

</script>

<style lang="scss" scoped>
    @import "../../../scss/common/mixins";
	@import "../../../scss/taschel/kanban";
</style>
