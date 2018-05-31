<template lang="pug">
	.navigator
		span(v-for="(crumb, idx) in breadcrumb", :key="crumb.id" @click="didPushCrumb(crumb)")
			span(v-if="idx < breadcrumb.length-1")
				a.link {{ crumb.name }}  
				span &nbsp;&gt;&nbsp;
			span(v-else)
				span {{ crumb.name }}  
</template>

<script>
	import Vue from "vue";
	import { mapGetters, mapActions } from "vuex";
	import { CLEAR_CRUKB } from "../../../service/fundamentals/mutationTypes";
	const _ = Vue.prototype._;

	export default {
		name : "Navigator"
		, computed : {
			...mapGetters([
				"breadcrumb"
			])
		}
		, methods : {
			...mapActions([
				"clearCrumb"
			])
			, didPushCrumb(crumb) {
				if (crumb.back) {
					crumb.back();
				}
			}
		}
		, created() {
			// when user move other pages by router, initialize breadcrumb.
			this.$router.afterEach((to, from) => {
				this.clearCrumb();
			});
		}
	}

</script>

<style lang="scss" scoped>
	.navigator {
		margin: 1em;
		padding-left: 0.5em;
		border-left: 3px solid #fff;
	}
</style>
