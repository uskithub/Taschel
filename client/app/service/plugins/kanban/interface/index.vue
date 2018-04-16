<template lang="pug">
	section
		h1 {{ _("Kanban") }}
</template>

<script>

	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	const _ = Vue.prototype._;
	
	export default {
		mixins : [ Base ]
		, data() {
			return {
			};
		}
	};
</script>

<style lang="scss" scoped>
</style>