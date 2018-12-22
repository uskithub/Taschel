<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		ul
			li(v-for="work in latestWorks", :key="work.id")
				.media
					.media-left
						img.avatar(src="")
					.media-content
						strong {{ work.title }}
						small.text-muted @johndoe - 31m ago
						p {{ work.description }}
						p goodSide: {{ work.goodSide }}
						p badSide: {{ work.badSide }}
						p improvement: {{ work.improvement }}
						.functions
							a(href="#")
								i.fa.fa-reply
							a(href="#")
								i.fa.fa-heart
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import Task from "../../fundamentals/entities/task";
	import Treenode from "../../plugins/gantt/treenode";
	import Projects from "../projects/index"
	// import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;

	export default {
		name : "Timeline"
		, mixins : [ Base ]
		, components : {
		}
		, computed : {
			...mapGetters([
				"latestWorks"
			])
		}
		, data() {
			return {
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getTimeline"
			])
			// UI Operations
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("Timeline") });
		}
		, sessionEnsured(me) {
			this.getTimeline();
		}
	};
</script>