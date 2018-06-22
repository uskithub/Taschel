<template lang="pug">
	.popup-container(@click="$emit('close', $event)")
		component(:is="component")
</template>
<script>
	export default {
		props: {
			component: {
				type: Object
			}
		}	
	}
</script>

<style lang="scss">
	.popup-container {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999;
	}
</style>
