<template lang="pug">
	section
		h1 {{ _("Kanban") }}
		kanban-board(:boards="boards")
</template>

<script>

	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";

	import KanbanBoard from "../../../fundamentals/components/board";

	const _ = Vue.prototype._;
	
	export default {
		mixins : [ Base ]
		, components : {
			KanbanBoard
		}
		, data() {
			return {
				boards: []
			};
		}
	};
</script>

<style lang="scss" scoped>
</style>