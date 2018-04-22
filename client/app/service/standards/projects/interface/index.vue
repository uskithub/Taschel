<template lang="pug">
	section
		editing(v-if="isEditing", :target="currentTask" @close="onClose")
		data-table(v-else, :schema="schema.table", :rows="tasks", :order="order", :selected="[currentTask]", :select="onSelect")
</template> 

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import DataTable from "../../../fundamentals/components/table";
	import Editing from "./editing";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_TASKS, SELECT_TASK } from "../../../fundamentals/mutationTypes";
	const _ = Vue.prototype._;
	
	export default {
		// using name for breadcrumb at create()
		name : "Project"
		, mixins : [ Base ]
		, components : {
			DataTable
			, Editing
		}
		, computed : {
			...mapGetters("task", [
				"tasks"
				, "currentTask"
			])
		}
		, data() {
			return {
				isEditing: false
				, schema
				, options: {}
				, order: {}
			};
		}
		, methods : {
			...mapMutations("task", {
				selectTask : SELECT_TASK
			})
			, ...mapActions("task", {
				readTasks : "readTasks"
			})
			, onSelect(e, row) {
				console.log("onselect", row);
				this.selectTask(row);
				this.isEditing = true;
			}
			, onClose() {
				this.isEditing = false;
			}
		}
		, created() {
		}
		, sessionEnsured(me) {
			 this.readTasks({ 
				options: { user : me.code }
				, mutation: `task/${LOAD_TASKS}`
			});
		}
	};
</script>

<style lang="scss" scoped>
</style>