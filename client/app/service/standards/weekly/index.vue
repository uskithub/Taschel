<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		board.weekly-grid(:boards="boards" @arrange="didArrangeTask")
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import Task from "../../fundamentals/entities/task";
	import Board from "../../plugins/kanban/board";
	import Kanban from "../../plugins/kanban/kanban";

	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;
	
	export default {
		name : "Weekly"
		, mixins : [ Base ]
		, computed : {
			...mapGetters([
				"groups"
				, "currentWeek"
			])
			, boards() {
				return this.groups.map( g => new Board(g) );
			}
		}
		, data() {
			return {
				isEditing: false
				, entity: null
				// , tableSchema : schema.table
				// , formSchema : schema.form
				, order : {}
				, options: {}
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getMyWeeklyTasks"
				, "arrangeTasks"
			])
			, didArrangeTask({ kanban, from, to, index }) {
				// console.log(kanban, from, to, index);
				from.code = from.id;
				to.code = to.id;
				from.type = from.type === "kanban" ? "task" : "group";
				to.type = to.type === "kanban" ? "task" : "group";
				this.arrangeTasks({ task: kanban.task, from, to, index });
			}

			, didSelectRow(entity) {
				this.entity = entity;
				this.isEditing = true;
			}
			, didPushAddButton() {
				this.isEditing = true;
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
				});
			}
		}
		, created() {
			this.setSelectorOnLastCrumb({ 
				items:[
					{ id: "hoge1", name: "ajgoi;reagoi;" }
					, { id: "hoge2", name: "vf,l;geajg" }
					, { id: "hoge3", name: "vfald;gjejgo" }
				]
				, itemDidPush: (item) => { 
					console.log(item);
				}
			});
			this.pushCrumb({ id: "week", name: this.currentWeek });
		}
		, sessionEnsured(me) {
			this.getMyWeeklyTasks();
		}
	};
</script>

<style lang="scss" scoped>

	@import "../../../../scss/common/mixins";

    $on-hold: #FB7D44;
    $in-progress: #2A92BF;
    $needs-review: #F4CE46;
    $approved: #00B961;

    .drag-column {
        &-on-hold {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $on-hold;
            }
        }

        &-in-progress {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $in-progress;
            }
        }

        &-needs-review {
            .drag-column-header,
            .is-moved,
            .drag-options{
                background: $needs-review;
            }
        }

        &-approved {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $approved;
            }
        }
	}
	
 	.section {
    	padding: 20px;
    	text-align: center;

    	a {
    		color: white;
    		text-decoration: none;
    		font-weight: 300;
    	}

    	h4 {
    		font-weight: 400;
    		a {
    			font-weight: 600;
    		}
    	}
    }

	.container {
		padding: 1rem;
	}

	.form {
		margin: 1rem 0;

		@include bgTranslucentDark(0.2);
		border-radius: 8px;

		.buttons {
			padding: 0.5em;
		}

	}
</style>
