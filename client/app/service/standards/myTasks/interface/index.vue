<template lang="pug">
	section
		h1 {{ _("V2 MyTasks") }}
		data-table(:schema="schema.table", :rows="tasks", :order="order", :selectedRows="selectedRows" @select="onSelect" @selectAll="onSelectAll")
</template>

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import DataTable from "../../../fundamentals/components/table";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_USER, LOAD_TASKS } from "../../../fundamentals/mutationTypes";
	const _ = Vue.prototype._;
	
	export default {
		mixins : [ Base ]
		, components : {
			DataTable
		}
		, computed : {
			...mapGetters("task", [
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
			...mapActions("task", {
				readTasks : "readTasks"
			})
			
				, onSelect(e, row) {
					console.log(e, row);
				}
				, onSelectAll(e) {
					console.log(e);
				}
			
		}
		, created() {
			if (this.me) {
				this.readTasks({ 
					options: { user : this.me.code }
					, mutation: `task/${LOAD_TASKS}`
				});
			} else {
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				this.$store.subscribe((mutation, state) => {
					if (mutation.type == `session/${SET_USER}`) {
						this.readTasks({ 
							options: { user : this.me.code }
							, mutation: `task/${LOAD_TASKS}`
						});
					}
				});				
			}
		}
	};
</script>

<style lang="scss" scoped>
</style>