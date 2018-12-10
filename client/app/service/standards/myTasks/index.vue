<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		editing(v-if="isEditing", :entity="entity", :taskTree="taskTree" , :schema="formSchema" @close="didReceiveCloseEvent")
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
	import Task from "../../fundamentals/entities/task";
	import Treenode from "../../plugins/gantt/treenode";
	import Editing from "./editing";
	import Projects from "../projects/index"
	import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;

	schema.table.columns = Task.createTableSchema(schema.table.columns);
	schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "MyTask"
		, mixins : [ Base ]
		, components : {
			Editing
		}
		, computed : {
			...mapGetters([
				"tasks"
				, "currentEditingTaskTree"
			])
		}
		, data() {
			return {
				isEditing: false
				, entity: null
				, taskTree: null
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
				, "getTaskDetail"
			])
			// Interfacial Operations
			, didSelectRow(entity) {
				this.entity = entity;
				this.getTaskDetail(entity)
					.then(() => {
						console.log("ほげ");
						if (this.currentEditingTaskTree !== null) {
							this.taskTree = new Treenode(this.currentEditingTaskTree);
						} else {
							// TODO: エラー
						}
						this.isEditing = true;
					});
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
			this.pushCrumb({ id: this._uid, name: _("MyTask") });
		}
		, sessionEnsured(me) {
			this.getMyTaskList();
		}
	};
</script>