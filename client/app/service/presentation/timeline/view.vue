<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		ul.timeline
			li(v-for="work in latestWorks", :key="work.id")
				.media
					.media-left
						img.avatar(src="")
					.media-content
						strong {{ work.title }}
						small.text-muted @{{ work.author }} - 31m ago
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
	import AbstractView from "service/presentation/mixins/abstractView";

	import Task from "service/domain/entities/task";
	import Treenode from "service/domain/entities/Treenode";

	import { mapGetters } from "vuex";

	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
		, computed : {
			...mapGetters([
				"latestWorks"
			])
		}
	};
</script>

<style lang="scss">

	.container {
		.timeline {
			list-style: none;
			padding: 0;

			li {
				margin-bottom: .5em; 
			}
		}
	}

</style>
