<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		.flex.align-center.justify-space-around
			.left(v-if="isAddButtonEnable")
				button.button.is-primary(@click="didPushAddButton")
					i.icon.fa.fa-plus 
					| {{ _("AddTdask") }}
			.center
				.form
					vue-form-generator(:schema="schema.userSelector", :model="modelUserSelector" ref="userSelector" @model-updated="selectUser")
		
			.right(v-if="currentWeek")
				button.button.is-primary(@click="buttonPrevDidPush")
					i.icon.fa.fa-arrow-left
				.tag.primary {{ currentWeek }}
				button.button.is-primary(@click="buttonNextDidPush")
					i.icon.fa.fa-arrow-right
		br
		kanban-board.weekly-grid(:boardGroups="boardGroups", @arrange="arrange" @select="select")
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import Task from "../../fundamentals/entities/task";
	// import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;

	// schema.table.columns = Task.createTableSchema(schema.table.columns);
	// schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "Weekly"
		, mixins : [ Base ]
		, components : {
		}
		, computed : {
			...mapGetters([
				"tasks"
				, "currentWeek"
			])
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
				"getMyTaskList"
			])
			// usecase: a user selects a task for editing.
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
			this.pushCrumb({ id: this._uid, name: this.currentWeek });
		}
		, sessionEnsured(me) {
			this.getMyTaskList();
		}
	};
</script>

<style lang="scss">
	@import "../../../../scss/common/mixins";
	@import "../../../../scss/taschel/kanban";

	// @see https://www.webcreatorbox.com/tech/css-flexbox-cheat-sheet
	.kanban-system-container {
		&.weekly-grid {
			display: flex;
			.kanban-board-container {
				&.content {
					&.card-columns {
						flex-grow: 1;

						&:nth-child(2) {
							flex-grow: 2;
							display: flex;
							flex-direction: row-reverse;
							flex-wrap: wrap;
							align-items: stretch;
							align-content: flex-start;

							.kanban-board {
								flex: inherit;
								flex-grow: inherit;
								width: 48%;
								margin: 0 1% 1% 1%;
							}
						}
					}
				}
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
