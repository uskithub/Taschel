<template lang="pug">
	.popup-container(@click="onclick")
		.panel.popup.primary
			.header  {{ title }}
			.body 
				component(:is="component", v-bind="props" ref="comp")
</template>
<script>

	export default {
		props: {
			title: {
				type: String
			}
			, component: {
				
			}
			, props: {
				type: Object
			}
			, events: {
				type: Object
			}
		}
		, methods : {
			onclick(e) {
				if (e.target.classList.contains("popup-container")) this.$emit("close", e);
			}
		}
		, mounted() {
			if (this.events) {
				const dynamicComponent = this.$refs.comp;
				Object.keys(this.events).forEach(key => {
					dynamicComponent.$on(key, this.events[key]);
				});
			}
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
			background-color: rgba(16, 67, 87, 0.8);
		}
	}
</style>
