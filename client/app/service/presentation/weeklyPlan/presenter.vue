<template lang="pug">
	kanban-board.weekly-grid(:boards="currentWeekPlanningBoards" @arrange="onArrange")
</template>

<script>
	import Vue from "vue";
    import AbstractPresenter from "system/mixins/abstractPresenter";
	
    import { mapGetters, mapActions } from "vuex";
    
    import { 
        自分の週次タスクを取得する
        , その週に実施するタスクの貢献度と緊急度を決める
		
	} from "service/application/usecases";
    
    const _ = Vue.prototype._;
	
	export default {
		name : "WeeklyPlan"
		, mixins : [ AbstractPresenter ]
		, computed : {
			...mapGetters([
				"currentWeekPlanningBoards"
				, "currentWeek"
				, "currentWeekOfMonth"
			])
		}
		, methods : {
			...mapActions([
                自分の週次タスクを取得する
                , その週に実施するタスクの貢献度と緊急度を決める
			])
			// Interfacial Operations
			, onArrange({ kanban, from, to, index }) {
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
				this.その週に実施するタスクの貢献度と緊急度を決める({ task: kanban.task, from: _from, to: _to, index });
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("WeeklyPlan") });
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
			this.自分の週次タスクを取得する();
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

					.layer {
						flex: none;
						width: 48%;
						margin: 0 1% 1% 1%;
					}
				}
			}
		}
	}
</style>
