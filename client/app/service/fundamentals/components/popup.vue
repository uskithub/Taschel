<template lang="pug">
	.popup-container(@click="$emit('close', $event)")
		.panel.popup.primary(@click.prevent.stop="")
			.header Panel primary
			.body 
				component(:is="component", v-bind="props")
		// test(title="hhhoooo")
		// test
</template>
<script>
	// import Test from "./test";

	export default {
		// components : {
		// 	Test
		// }
		// , 
		props: {
			component: {
				type: Object
			}
			, props: {
				type: Object
			}
		}
		, computed : {
			// component() {
			// 	return Test;
			// }
		// 	props() {
		// 		return {
		// 			title: "yooohooo"
		// 		}
		// 	}
		}
	}
</script>

<style lang="scss" scoped>
	.popup-container {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999;

		.popup {
			position: absolute;
			top: 10vh;
			right: 0;
			left: 0;
			margin: 0 auto;
			width: 90vw;
		}
	}
</style>
