<template lang="pug">
	v-navigation-drawer(
		v-model="drawer"
		:clipped="$vuetify.breakpoint.lgAndUp"
		fixed
		app
	)
		v-list(dense)
			template(v-for="item in items")
				v-layout(
					v-if="item.heading"
					:key="item.heading"
					row
					align-center
				)
					v-flex(xs6)
						v-subheader(v-if="item.heading") {{ item.heading }}
					v-flex.text-xs-center(xs6)
						a.body-2.black--text(href="#!") EDIT
				v-list-group(
					v-else-if="item.children"
					v-model="item.model"
					:key="item.text"
					:prepend-icon="item.model ? item.icon : item['icon-alt']"
					append-icon=""
				)
					template(v-slot:activator)
						v-list-tile
							v-list-tile-content
								v-list-tile-title {{ item.text }}
					v-list-tile(
						v-for="(child, i) in item.children"
						:key="i"
						@click=""
					)
						v-list-tile-action(v-if="child.icon")
							v-icon {{ child.icon }}
						v-list-tile-content
							v-list-tile-title {{ child.text }}
				v-list-tile(v-else :key="item.text" @click="")
					v-list-tile-action
						v-icon {{ item.icon }}
					v-list-tile-content
						v-list-tile-title {{ item.text }}
</template>
<script>
	export default {
		props: {
			isOpen: Boolean
			, items : Array
		}
		, data() {
			const isOpen = this.isOpen;
			return {
				drawer: null
			}
		}
		, watch: {
			isOpen(newValue) {
				this.drawer = newValue;
			}
			, drawer(newValue) {
				this.$emit("toggle-drawer", newValue);
			}
		}
		
	};
</script>