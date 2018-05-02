<template lang="pug">
	.search-box
		i.fa.fa-search
		input(type="search", v-model="text", :placeholder="_('Search3dots')")

</template>

<script>
	import { mapGetters, mapActions } from "vuex";

	export default {
		name: "SearchBox"
        , computed: {
			...mapGetters("environment/session", [
				"searchText"
			])
			, text: {
				get() {
					return this.searchText;
				}
				, set(value) {
					this.searching(value);
				}
			}
		},

		methods: {
			...mapActions("environment/session", [
				"searching"
			])
		}
	};
	
</script>

<style lang="scss">
</style>