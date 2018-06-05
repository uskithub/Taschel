<template lang="pug">
	.navigator
		span(v-for="(crumb, idx) in breadcrumb", :key="crumb.id" @click="didPushCrumb(crumb)")
			span(v-if="idx < breadcrumb.length-1")
				a.link {{ crumb.name }}
				span &nbsp;&gt;&nbsp;
			span(v-else)
				span {{ crumb.name }}
		div(v-if="true")
			ul.menu
				li hoge
				li hoge
				li hoge
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
		, data() {
			return {

			};
		}
		, methods : {
			...mapActions([
				"clearCrumb"
			])
			, didPushCrumb(crumb) {
				if (crumb.didPush) {
					crumb.didPush();
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

	.menu {
		position: relative;
  		margin: 0;
  		padding: 0;
  		list-style: none;

		li {
  			position: relative;
	  		float: left;
  			border: 2px solid #fff;

		  a {
				display: inline-block;
				padding: 1em 4em;
				color: #fff;
				line-height: 1;
				text-align: center;
				text-decoration: none;
				white-space: nowrap;
			}
		}
		li:not(:first-child) {
			border-left: none;
		}
		li:hover {
			background-color: rgba(255,255,255,.3);
		}
	}

	.menu::after {
  		display: block;
  		clear: both;
  		content: '';
	}

	
</style>
