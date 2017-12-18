<template lang="pug">
	.popup(:class="{ 'visible': schema.isVisible }")
		.panel
			.header {{ schema.title }}
			.body 
				p {{ schema.message }}
			.block
				button.button.success(@click="schema.buttons[0].action") {{ schema.buttons[0].label }}
</template>

<script>

	export default {

		props: [
			"schema"
		]

	};
	
</script>

<style lang="scss">

	.popup {
		visibility: hidden;
		opacity: 0;
		transition: all .4s ease;

		position: absolute;
		right: 200px;
		min-width: 190px;
		width: 400px;

		font-size: 0.8em;

		&.visible {
			visibility: visible;
			opacity: 1;
		}
	}

</style>