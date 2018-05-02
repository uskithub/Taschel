<!-- // DDD: Presentation -->
<template lang="pug">
	section
		h1 {{ _("V2 MyTasks") }}
		data-table(:schema="schema.table", :rows="tasks", :order="order", :selectedRows="selectedRows" @select="onSelect" @selectAll="onSelectAll")
</template>

<!-- // DDD: Application Sevice -->
<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_USER, LOAD_TASKS } from "../../fundamentals/mutationTypes";
	const _ = Vue.prototype._;
	
	export default {
		mixins : [ Base ]
		, components : {
			DataTable
		}
		, computed : {
			...mapGetters("environment/task", [
				"tasks"
				, "currentTask"
			])
			, selectedRows() {
				return (this.currentTask) ? [ this.currentTask ] : [];
			}
		}
		, data() {
			return {
				schema
				, order : {}
				, options: {}
			};
		}
		, methods : {
			...mapActions("environment/task", {
				// DDD: Domain Service
				// Name actions in accordance with their use-cases.
				getMyTaskList : "getTaskList"
			})
			, onSelect(e, row) {
				console.log(e, row);
			}
			, onSelectAll(e) {
				console.log(e);
			}
		}
		, created() {
		}
		, sessionEnsured(me) {
			this.getMyTaskList({ 
				options: { user : me.code }
				, mutation: `environment/task/${LOAD_TASKS}`
			});
		}
	};
</script>

<style lang="scss" scoped>
</style>