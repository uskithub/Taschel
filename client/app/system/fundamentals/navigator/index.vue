<template lang="pug">
	nav
		ul
			li(v-for="(crumb, idx) in breadcrumb", :key="crumb.id" @click="didPushCrumb(crumb)" @mouseover="onmouseover($event, crumb)" @mouseout="onmouseout($event, crumb)")
				span(v-if="idx < breadcrumb.length-1")
					a.link {{ crumb.name }}
					span.gt &nbsp;&gt;&nbsp;
				span(v-else)
					span {{ crumb.name }}
				ul(v-if="isHovering && crumb.items")
					li(v-for="item in crumb.items" @click="onclickitem(crumb, item)") {{ item.name }}
</template>

<script>
	import Vue from "vue";
	import { mapGetters, mapActions } from "vuex";
	
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
				isHovering: false
			};
		}
		, methods : {
			...mapActions([
				"clearCrumb"
			])
			, didPushCrumb(crumb) {
				if (crumb.didPush) {
					crumb.didPush();
					console.log("falseってるけどな")
					this.isHovering = false;
				}
			}
			, onmouseover(event, crumb) {
				this.isHovering = true;
			}
			, onmouseout(event, crumb) {
				this.isHovering = false;
			}
			, onclickitem(crumb, item) {
				crumb.itemDidPush(item);
				this.isHovering = false;
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
			z-index: 100;

			li {
				position: relative;
				float: left;
				margin: 0 0.25em;

				.gt {
					margin-left: 0.5em;
				}

				& > ul {
					position: absolute;
					//display: none;
					top: 100%;

					li {
						float: none;
						margin: 0;
						padding: 0.5em;
						background: #c0c0c0;
						border-bottom: 1px solid #fff;
						cursor: pointer;
					}

					li:last-child {
						border-bottom: none;
					}

					ul {
						position: absolute;
						display: none;
						top: -2px;
						left: 100%;
					}
				}
			}

			li:hover {
				text-decoration: underline;
				& > ul {
					display: block;
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
