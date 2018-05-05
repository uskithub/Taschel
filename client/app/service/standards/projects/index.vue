<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		editing(v-if="isEditing", :target="currentProject", :schema="schema" @save="onSave" @close="onClose")
		div(v-else)
			.flex.align-center.justify-space-around
				.left
					button.button.is-primary(@click="onAddProject")
						i.icon.fa.fa-plus 
						| {{ _("AddProject") }}
				.right
			data-table(:schema="schema.table", :rows="projects", :order="order", :selectedRows="[currentProject]" @select="onSelect")
</template> 

<!-- // DDD: Application Sevice -->
<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import Editing from "./editing";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_PROJECTS, SET_CURRENT_PROJECT, CLEAR_SELECTION } from "../../fundamentals/mutationTypes";
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
				, schema
				, options: {}
				, order: {}
			};
		}
		, methods : {
			...mapMutations("environment/session", {
				// DDD: Domain Service
				// Name mutations in accordance with their use-cases.
				editProject : SET_CURRENT_PROJECT
				, clearSelection : CLEAR_SELECTION
			})
			, ...mapActions("environment/session", {
				// DDD: Domain Service
				// Name actions in accordance with their use-cases.
				getUserProjectList : "getUserProjectList"
			})
			, onSelect(event, entity) {
				console.log("onselect", entity);
				this.editProject(entity);
				this.isEditing = true;
			}
			, onAddProject() {
				this.isEditing = true;
			}
			, onSave() {
				this.isEditing = false;
				this.$nextTick(() => {
					this.clearSelection();
				});
			}
			, onClose() {
				this.isEditing = false;
				this.$nextTick(() => {
					this.clearSelection();
				});
			}
		}
		, created() {
		}
		, sessionEnsured(me) {
			 this.getUserProjectList({ 
				options: { user : me.code }
				, mutation: `environment/session/${LOAD_PROJECTS}`
			});
		}
	};
</script>

<style lang="scss" scoped></style>