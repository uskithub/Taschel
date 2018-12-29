<template lang="pug">
	vue-tags-input(v-model="value", :autocompleteItems="schema.values", :addOnlyFromAutocomplete="schema.values != undefined", :autocompleteAlwaysOpen="schema.values != undefined")
</template>

<script>
	/* global $ */
	import { abstractField } from "vue-form-generator";
	import VueTagsInput from "./vue-tags-input";
	import { defaults } from "lodash";

	export default {
		name: "fieldTagsInput"
		, mixins: [ abstractField ]
		, components: {
			VueTagsInput
		}
		, data() {
			return {};
		}
		, methods: {
			
		}
		, created() {
			console.log("● value", this.value);
		}
		, mounted() {
			
		}
		, beforeDestroy() {
			
		}
	};
</script>

<style lang="scss">

	.autocomplete {
		color: #000;
	}

</style>