<template lang="pug">
	section
		h1 {{ _("MyTasks") }}
		data-table(:schema="schema.table", :rows="tasks", :order="order", :selected="[currentTask]", :select="select", :select-all="selectAll")
</template>

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import DataTable from "../../../fundamentals/components/table";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_TASK } from "../../../fundamentals/mutationTypes";
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
		}
		, data() {
			return {
				schema
				, options: {}
				, currentWeek : "2018-04-10"
			};
		}
		, methods : {
			...mapActions("task", {
				readTasks : "readTasks"
			})
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
						this.getTasks({ 
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