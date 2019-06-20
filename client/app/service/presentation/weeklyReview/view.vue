<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
			.body
				kanban-board(:boards="[currentWeekReviewBoard]" @arrange="onArrange")
					template(v-slot:kanban="slotProps")
						.text-muted(v-if="typeof slotProps.content === 'string'") {{ slotProps.content }}
						table(v-else)
							tr(v-show="slotProps.content.goodSide")
								th {{ _("GoodSideLabel") }} 
								td {{ slotProps.content.goodSide }}
							tr(v-show="slotProps.content.badSide")
								th {{ _("BadSideLabel") }}
								td {{ slotProps.content.badSide }}
							tr(v-show="slotProps.content.improvement")
								th {{ _("ImprovementLabel") }}
								td {{ slotProps.content.improvement }}
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
				, "currentWeekReviewLayer"
				, "currentWeekReviewBoard"
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
			, onArrange({ kanban, from, to, index }) {
				this.$emit("select", { kanban, from, to, index });
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
		list-style-type: none;
		margin: 0;
		padding: 0;

		.board {
			margin: 0 0.5em;
			padding: 0 0.5em;
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
					margin: 0;
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