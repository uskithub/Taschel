<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		div
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
			])
		}
		, data() {
			return {
			};
		}
		, methods : {
			...mapActions([
				// Usecases
			])
			// UI Operations
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("Timeline") });
		}
		, sessionEnsured(me) {
			
		}
	};
</script>