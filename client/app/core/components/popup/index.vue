<template lang="pug">
	.messages-dropdown(:class="{ 'visible': visible }")
		.card
			.ribbon.right.orange 
				span -20%
			img.img(src="http://lorempixel.com/350/150/city")
			.block 
				.title Card with image
				p Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dicta cumque assumenda culpa maiores omnis totam obcaecati voluptas eligendi sapiente enim debitis, illo dolore facilis, in, nihil perspiciatis, et perferendis.
			.block
				button.button.success Checkout
</template>

<script>
export default {
  props: ["visible"]
};
</script>

<style lang="scss">
</style>