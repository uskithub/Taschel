<!-- // DDD: Presentation -->
<template lang="pug">
	board.weekly-grid(:boardGroups="boardGroups" @arrange="didArrangeTask")
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import Task from "../../fundamentals/entities/task";
	import BoardGroup from "../../plugins/kanban/boardGroup";
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
			, boardGroups() {
				let boards = this.groups.map( g => new Board(g) );
				const first = boards.shift();
				let boardGroups = new Array();
				boardGroups.push(new BoardGroup("unclassified", [first]));
				boardGroups.push(new BoardGroup("classified", boards));
				return boardGroups;
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
				, "arrangeTasksInGroups"
			])
			// Interfacial Operations
			, didArrangeTask({ kanban, from, to, index }) {
				console.log(kanban, from, to, index);
				let _from = {};
				if (from.type === "kanban") {
					_from.type = "task";
					_from.entity = from.entity.task;
				} else {
					_from.type = "group";
					_from.entity = from.entity.group;
				}
				let _to = {};
				if (to.type === "kanban") {
					_to.type = "task";
					_to.entity = to.entity.task;
				} else {
					_to.type = "group";
					_to.entity = to.entity.group;
				}
				this.arrangeTasksInGroups({ task: kanban.task, from: _from, to: _to, index });
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
			this.pushCrumb({ id: this._uid, name: _("Weekly") });
			this.setSelectorOnLastCrumb({
				// TODO: 週の一覧を出す
				items:[
					{ id: "hoge1", name: "ajgoi;reagoi;" }
					, { id: "hoge2", name: "vf,l;geajg" }
					, { id: "hoge3", name: "vfald;gjejgo" }
				]
				, itemDidPush: (item) => { 
					console.log(item);
				}
			});
			this.pushCrumb({ id: "week", name: this.currentWeekOfMonth });
		}
		, sessionEnsured(me) {
			this.getMyWeeklyTasks();
		}
	};
</script>

<style lang="scss">

	.kanban-system-container {
		&.weekly-grid {
			display: flex;
			
			.kanban-board-container {
				flex: 1;

				&:nth-child(2) {
					flex-grow: 2;
					flex-direction: row-reverse;
					flex-wrap: wrap;
					align-items: stretch;
					align-content: flex-start;

					.kanban-board {
						flex: none;
						width: 48%;
						margin: 0 1% 1% 1%;
					}
				}
			}
		}
	}
</style>
