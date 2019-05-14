<template lang="pug">
	weekly-review-view
</template>
<script>
	import Vue from "vue";
    import AbstractPresenter from "system/mixins/abstractPresenter";
	import WeeklyReviewView from "./view"

    import Task from "service/domain/entities/task";
	
	// import schema from "./schema";
    import { mapActions } from "vuex";

    import {
        自分のその週のレビュー一覧を取得する
    } from "service/application/usecases";
    
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
            })
			
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("WeeklyReview") });
		}
		, sessionEnsured(me) {
			this.自分のその週のレビュー一覧を取得する();
		}
	};
</script>