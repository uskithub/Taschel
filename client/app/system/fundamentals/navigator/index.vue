<template lang="pug">
	.navigator
		span(v-for="crumb in breadcrumb", :key="crumb.id" @click="onClick($event, crumb)") {{ crumb.name }} &nbsp;&gt;&nbsp;
</template>

<script>
	import Vue from "vue";
	import { mapGetters, mapMutations } from "vuex";
	import { CLEAR_CRUKB } from "../../../service/fundamentals/mutationTypes";
	const _ = Vue.prototype._;

	export default {
		name : "Navigator"
		, computed : {
			...mapGetters("environment/session", [
				"breadcrumb"
			])
		}
		, methods : {
			...mapMutations("environment/session", {
				clearCrumb : CLEAR_CRUKB
			})
			, onClick(e, crumb) {
				if (crumb.back) {
					crumb.back();
				} else {
					console.log("backがない", crumb);
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
