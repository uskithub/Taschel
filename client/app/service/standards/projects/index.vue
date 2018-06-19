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
			data-table(:schema="tableSchema", :rows="projects", :order="order", :selectedRows="[entity]" @select="didSelectRow")
</template> 

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import Project from "../../fundamentals/entities/project";
	import Editing from "./editing";
	import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	import { cloneDeep } from "lodash";

	const _ = Vue.prototype._;

	schema.table.columns = Project.createTableSchema(schema.table.columns);
	schema.form.fields = Project.createFormSchema(schema.form.fields);
	
	export default {
		// using name for breadcrumb at create()
		name : "Project"
		, mixins : [ Base ]
		, components : {
			DataTable
			, Editing
		}
		, computed : {
			...mapGetters([
				"projects"
			])
		}
		, data() {
			return {
				isEditing: false
				, entity: null
				, tableSchema : schema.table
				, formSchema : schema.form
				, options: {}
				, order: {}
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getUserProjectList"
			])
			// Interfacial Operations
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
			this.getUserProjectList();
		}
	};
</script>

<style lang="scss" scoped></style>