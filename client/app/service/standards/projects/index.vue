<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		editing(v-if="isEditing", :entity="entity", :schema="schema" @close="onClose")
		div(v-else)
			.flex.align-center.justify-space-around
				.left
					button.button.is-primary(@click="onAddProject")
						i.icon.fa.fa-plus 
						| {{ _("AddProject") }}
				.right
			data-table(:schema="schema.table", :rows="projects", :order="order", :selectedRows="[entity]" @select="onSelect")
</template> 

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import Editing from "./editing";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../../fundamentals/mutationTypes";
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
			...mapGetters("environment/session", [
				"projects"
				, "currentProject"
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
			...mapActions("environment/session", [
				// Usecases
				"getUserProjectList"
				, "selectProject"
			])
			, onSelect(entity) {
				console.log("onselect", entity);
				this.entity = entity;
				this.isEditing = true;
			}
			, onAddProject() {
				this.isEditing = true;
			}
			, onSave(rawValues) {
				// TODO 
				this.isEditing = false;
				this.$nextTick(() => {
					// nextTickの中でentityをnullにすることで、
					this.entity = null;
				});
			}
			, onClose() {
				this.isEditing = false;
				this.$nextTick(() => {
					this.entity = null;
				});
			}
		}
		, created() {
		}
		, sessionEnsured(me) {
			 this.getUserProjectList({ options: { user : me.code } });
		}
	};
</script>

<style lang="scss" scoped></style>