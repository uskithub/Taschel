<template lang="pug">
	vue-tags-input(v-model="value", :tags="tags")
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
			// createdより早くmodelが参照されるので、ここで詰めている
			return {
				tags: []
			};
		}
		, methods: {
			
		}
		, mounted() {
			
		}
		, beforeDestroy() {
			
		}
	};
</script>


<style lang="sass">
</style>