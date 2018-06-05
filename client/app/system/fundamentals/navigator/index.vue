<template lang="pug">
	nav
		ul
			li(v-for="(crumb, idx) in breadcrumb", :key="crumb.id" @click="didPushCrumb(crumb)")
				span(v-if="idx < breadcrumb.length-1")
					a.link {{ crumb.name }}
					span.gt &nbsp;&gt;&nbsp;
				span(v-else)
					span {{ crumb.name }}
				ul(v-if="crumb.items")
					li(v-for="item in crumb.items" @click="crumb.itemDidPush(item)") {{ item }}
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

	nav {
		position: relative;
		margin: 1em;
		padding-left: 0.5em;
		border-left: 3px solid #fff;

		ul {
			margin: 0;
			padding: 0;
			list-style: none;

			li {
				position: relative;
				float: left;
				margin: 0 0.25em;

				.gt {
					margin-left: 0.5em;
				}
			}

			li:hover {
				& > ul {
					display: block;
				}
			}

			ul {
				position: absolute;
				display: none;
				top: 100%;
				left: -2px;

				li {
					float: none;
					margin: 0;
					border: 2px solid #fff;
				}

				ul {
					position: absolute;
					display: none;
					top: -2px;
					left: 100%;
				}
			}
		}

		ul::after {
			display: block;
			clear: both;
			content: '';
		}
	}
	
</style>
