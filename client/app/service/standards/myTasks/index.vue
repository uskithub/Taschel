<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		editing(v-if="isEditing", :entity="entity", :schema="formSchema" @close="didReceiveCloseEvent")
		div(v-else)
			.flex.align-center.justify-space-around
				.left
					button.button.is-primary(@click="didPushAddButton")
						i.icon.fa.fa-plus 
						| {{ _("AddProject") }}
				.right
			data-table(:schema="tableSchema", :rows="tasks", :order="order", :selectedRows="[entity]" @select="didSelectRow")
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import Task from "../../fundamentals/entities/task";
	import Editing from "./editing";
	import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;
	
	export default {
		name : "MyTask"
		, mixins : [ Base ]
		, components : {
			DataTable
			, Editing
		}
		, computed : {
			...mapGetters([
				"tasks"
			])
		}
		, data() {
			schema.table.columns = Task.createTableSchema(schema.table.columns);
			schema.form.fields = Task.createFormSchema(schema.form.fields);
			
			return {
				isEditing: false
				, entity: null
				, tableSchema : schema.table
				, formSchema : schema.form
				, order : {}
				, options: {}
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getMyTaskList"
			])
			// usecase: a user selects a task for editing.
			, didSelectRow(entity) {
				this.entity = entity;
				this.isEditing = true;
			}
			, didPushAddButton() {
				this.isEditing = true;
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
				});
			}
		}
		, created() {
		}
		, sessionEnsured(me) {
			this.getMyTaskList();
		}
	};
</script>

<style lang="scss" scoped>
</style>