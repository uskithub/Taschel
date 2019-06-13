<template lang="pug">
	weekly-review-view(@select="onSelect")
</template>
<script>
	import Vue from "vue";
    import AbstractPresenter from "system/mixins/abstractPresenter";
	import WeeklyReviewView from "./view"

    import Task from "../../domain/entities/task";
	
	// import schema from "./schema";
    import { mapActions } from "vuex";

    import {
		自分のその週のレビュー一覧を取得する
		, 自分のその週の週次レビューを取得する
		, レビュー対象を選択する
    } from "../../application/usecases";
    
	const _ = Vue.prototype._;

	export default {
		name : "WeeklyReview"
		, mixins : [ AbstractPresenter ]
		, components : {
			WeeklyReviewView
		}
		, data() {
			return {
			};
		}
		, methods : {
            ...mapActions({
				自分のその週のレビュー一覧を取得する
				, 自分のその週の週次レビューを取得する
				, レビュー対象を選択する
            })
			, onSelect({ kanban, from, to, index }) {
				console.log(kanban, from, to, index);
				if (kanban._work !== undefined) {
					this.レビュー対象を選択する({ type: "work", item: kanban._work, index});
				} else {
					this.レビュー対象を選択する({ type: "review", item: kanban._review, index });
				}
				
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("WeeklyReview") });
		}
		, sessionEnsured(me) {
			return this.自分のその週のレビュー一覧を取得する()
				.then(()=> {
					return this.自分のその週の週次レビューを取得する()
				})
		}
	};
</script>