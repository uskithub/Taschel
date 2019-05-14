<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
			.body
				ul.review-container
					li.board.daily-works(v-for="review in currentWeekReviews", key="reviewOfDay", :class="{ active : isHighOrderReview }"
						@click.prevent.stop="onSelect($event, null, reviewingWorks.length+1)"
					)
						span.board-header
							legend {{ review.date }}
						ul.work-list(data-code="daily" ref="works")
							//- li.highOrderReview(v-if="entity && entity.highOrderAwakening" key="HighOrderReview") 
							//- 	slot(name="HighOrderAwakening")
							//- 		strong {{ _("HighOrderAwakening") }}
							//- 	.text-muted {{ entity.highOrderAwakening }}
							//- 	message(v-if="entity.comments" v-for="comment in entity.comments", :key="comment.code", :comment="comment", :user="getUser(comment.author)")
							li(v-for="(work, i) in review.works", :class="{ active : index == i }", :data-code="work.code", :key="work.code" ref="items"
								@click.prevent.stop="onSelect($event, work, i)"
							)
								work-review(:work="work")
					//- li.board.form(key="form")
					//- 	vue-form-generator(:schema="dynamicForm", :model="dynamicModel", :options="options", ref="form", :is-new-model="isNewEntity")

					//- 	.errors.text-center
					//- 		div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
					//- 			strong {{ item.error }}

					//- 	.buttons.flex.justify-end
					//- 		button.button.outline(@click="")
					//- 			i.icon.fa.fa-chevron-left
					//- 			| {{ _("Back") }}
					//- 		button.button.primary(@click="")
					//- 			i.icon.fa.fa-save 
					//- 			| {{ dynamicButtonCaption }}
</template>
<script>
	import Vue from "vue";
    import AbstractView from "system/mixins/abstractView";
    
    import { mapGetters } from "vuex";
    
	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
        , props: {
			schema : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
			, entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
        }
		, computed : {
			...mapGetters([
                "currentWeek"
                , "currentWeekOfMonth"
                , "currentWeekReviews"
            ])
            , header() { return `${ this.currentWeekOfMonth } の振り返り`; }
		}
		, data() {
			return {
				order : {}
			};
		}
		, methods : { 
			selectButtonDidPush(entity) {
				this.$emit("select", entity);
			}
        }
        , created() {
            const reviews = this.currentWeekReviews;
            console.log("!!reviews", reviews);
		}
	};
</script>
<style lang="scss" scoped>
    .review-container {
		display: flex;
		align-items: flex-start;
		list-style-type: none;
		margin: 0;
		padding: 0;

		.board {
			flex: 1;
			align-items: flex-start;
			margin: 0 0.5em;
			position: relative;
			background: rgba(black, 0.2);
			overflow: hidden;

			&.daily-works {
				border: 2px solid transparent;

				&.active {
					border: 2px solid yellow;
				}
			}

			.board-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 10px;

				legend {
					margin-left: 0;
					margin-bottom: 0;
				}
			}

			.work-list {
				list-style-type: none;
				margin: 0;
				padding: 0;
				min-height: 100px;
				color: white;
				border: 1px solid transparent;

				li {
					margin: 0.5em;
					padding: 0.5em;
					background: rgba(black, 0.4);
					border: 2px solid transparent;

					&.highOrderReview {
						background: none;
					}

					&.active {
						border: 2px solid yellow;
					}
				}
			}
		}
	}
</style>