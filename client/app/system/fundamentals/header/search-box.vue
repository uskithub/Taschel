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
			// ...mapGetters([
			// 	"searchText"
			// ])
			// , 
			text: {
				get() {
					// return this.searchText;
					return "";
				}
				, set(value) {
					// this.searching(value);
				}
			}
		},

		methods: {
			// ...mapActions([
			// 	"searching"
			// ])
		}
	};
	
</script>

<style lang="scss">
</style>