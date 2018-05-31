<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		editing(v-if="isEditing", :entity="entity", :schema="schema" @close="didReceiveCloseEvent")
		div(v-else)
			.flex.align-center.justify-space-around
				.left
					button.button.is-primary(@click="didPushAddButton")
						i.icon.fa.fa-plus 
						| {{ _("AddProject") }}
				.right
			data-table(:schema="schema.table", :rows="projects", :order="order", :selectedRows="[entity]" @select="didSelectRow")
</template> 

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import Editing from "./editing";
	import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
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
			...mapGetters([
				"projects"
			])
		}
		, data() {
			return {
				isEditing: false
				, entity: null
				, schema
				, options: {}
				, order: {}
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getUserProjectList"
				, "selectProject"
			])
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