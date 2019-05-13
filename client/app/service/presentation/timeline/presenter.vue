<template lang="pug">
	.container
		timeline-view()
</template>
<script>
	import Vue from "vue";
	import AbstractPresenter from "service/presentation/mixins/abstractPresenter";
	import TimelineView from "./view";
	
	import { mapActions } from "vuex";

	import { 
        タイムラインを取得する
	} from "service/application/usecases";

	const _ = Vue.prototype._;

	export default {
		name : "Timeline"
		, mixins : [ AbstractPresenter ]
		, components : {
			TimelineView
		}
		, methods : {
			...mapActions([
				タイムラインを取得する
			])
			// UI Operations
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("Timeline") });
		}
		, sessionEnsured(me) {
			this.タイムラインを取得する();
		}
	};
</script>