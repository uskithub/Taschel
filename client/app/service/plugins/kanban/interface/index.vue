<template lang="pug">
	section
		h1 {{ _("Kanban") }}
		kanban-board(:boards="boards")
</template>

<script>

	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";


	const _ = Vue.prototype._;
	
	export default {
		mixins : [ Base ]
		
		, data() {
			return {
				boards: []
			};
		}
	};
</script>

<style lang="scss" scoped>
</style>