<template lang="pug">
	v-toolbar(
		:clipped-left="$vuetify.breakpoint.lgAndUp"
		color="blue darken-3"
		dark
		app
		fixed
	)
		v-toolbar-title.ml-0.pl-3(style="width: 300px")
			v-toolbar-side-icon(@click.stop="$emit('click-side-icon')")
			span.hidden-sm-and-down {{ appTitle }}
		v-text-field.hidden-sm-and-down(
			flat
			solo-inverted
			hide-details
			prepend-inner-icon="search"
			label="Search"
		)
		v-spacer
		v-btn(icon)
			v-icon apps
		v-btn(icon)
			v-icon notifications
		v-btn(icon large)
			v-avatar(size="32px" tile)
				img(
					src="https://cdn.vuetifyjs.com/images/logos/logo.svg"
					alt="Vuetify"
				)
</template>
<script>
	export default {
		props: {
			appTitle: String
		}
	};
</script>