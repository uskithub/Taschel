<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="enabledNew")
				button.button.is-primary(@click="buttonNewDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
			.right {{ _("SelectedOfAll", { selected: selected.length, all: rows.length } ) }}
		br
		data-table(:schema="schema.table", :rows="rows", :order="order", :search="search", :selected="selected", :select="select", :select-all="selectAll")

		.form(v-if="model")
			vue-form-generator(:schema='schema.form', :model='model', :options='options', :multiple="selected.length > 1", ref="form", :is-new-model="isNewModel")

			.errors.text-center
				div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
					strong {{ item.error }}

			.buttons.flex.justify-space-around
				button.button.primary(@click="buttonSaveDidPush", :disabled="!enabledSave")
					i.icon.fa.fa-save 
					| {{ schema.resources.saveCaption || _("Save") }}
				button.button.outline(@click="buttonBreakdownDidPush", :disabled="!enabledBreakdown")
					i.icon.fa.fa-copy 
					| {{ schema.resources.breakdownCaption || _("Breakdown") }}
				button.button.outline(@click="buttonCloneDidPush", :disabled="!enabledClone")
					i.icon.fa.fa-copy 
					| {{ schema.resources.cloneCaption || _("Clone") }}
				button.button.danger(@click="buttonDeleteDidPush", :disabled="!enabledDelete")
					i.icon.fa.fa-trash 
					| {{ schema.resources.deleteCaption || _("Delete") }}

</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import DataTable from "./dataTable.vue";

	import { each, find, cloneDeep, isFunction } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
			DataTable
		},

		props: [
			"schema",
			"selected",
			"rows"
		],

		data() {
			return {
				order: {
					field: "id",
					direction: 1
				},

				model: null,
				isNewModel: false
			};
		},

		computed: {
			...mapGetters("session", {
				search: "searchText"
			}),

			options() 		{ return this.schema.options || {};	},

			enabledNew() 	{ return (this.options.enableNewButton !== false); },
			enabledSave() 	{ return (this.model && this.options.enabledSaveButton !== false); },
			enabledClone() 	{ return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },
			enabledBreakdown() 	{ return (this.model && !this.isNewModel && this.options.enabledBreakdownButton !== false); },
			enabledDelete() { return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },

			validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		},	

		watch: {
			// propsで指定した名前に合わせる必要あり
			selected() {
				if (!this.isNewModel)
					this.generateModel();
			}

			/*
			model: {
				handler: function(newVal, oldVal) {
					if (newVal === oldVal) // call only if a property changed, not the model
						console.log("Model property changed!");
				},
				deep: true
			}*/
		},

		methods: {

			select(event, row, add) {
				this.isNewModel = false;
				
				if (this.schema.table.multiSelect === true && (add || (event && event.ctrlKey))) {
					this.$parent.selectRow(row, true);
				} else {
					this.$parent.selectRow(row, false);
				}
			},

			selectAll(event) {
				this.isNewModel = false;

				let filter = Vue.filter("filterBy");
				let filteredRows = filter(this.rows, this.search);

				if (this.selected.length < filteredRows.length) {
					// Select all
					this.$parent.selectRow(filteredRows, false);
				} else {
					// Unselect all 
					this.$parent.clearSelection();
				}
			},	

			generateModel() {
				if (this.selected.length == 1) {
					this.model = cloneDeep(this.selected[0]);
				}
				else if (this.selected.length > 1) {
					this.model = schemaUtils.mergeMultiObjectFields(this.schema.form, this.selected);
				}
				else
					this.model = null;
			}

			, buttonNewDidPush() {
				console.log("Create new model...");

				this.$parent.clearSelection();

				let newRow = schemaUtils.createDefaultObject(this.schema.form);
				this.isNewModel = true;
				this.model = newRow;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}

			, buttonSaveDidPush() {
				console.log("Save model...", this.model);
				if (this.options.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel)
						this.$parent.saveRow(this.model);
					else
						this.$parent.updateRow(this.model);

				} else {
					// Validation error
				}
			}

			, buttonCloneDidPush() {
				console.log("Clone model...");
				let baseModel = this.model;
				this.$parent.clearSelection();

				let newRow = cloneDeep(baseModel);
				newRow.id = null;
				newRow.code = null;
				this.isNewModel = true;
				this.model = newRow;
			}

			, buttonBreakdownDidPush() {
				console.log("Breakdown model...");
				let baseModel = this.model;
				this.$parent.clearSelection();

				let newRow = cloneDeep(baseModel);
				newRow.id = null;
				newRow.code = null;
				newRow.type = "step";
				newRow.name = null;
				newRow.purpose = `${this.model.goal} にするため`;
				newRow.goal = null;
				newRow.children = [];
				// TODO: 今はrootは必ずtype==projectであるとしている
				if (this.model.root === undefined) {
					newRow.root_code = (this.model.type == "project") ? this.model.code : null;
				} else {
					newRow.root_code = this.model.root.code;
				}
				newRow.parent_code = this.model.code;
				newRow.asignee_code = undefined;
				this.isNewModel = true;
				this.model = newRow;
			}

			, buttonDeleteDidPush() {
				if (this.selected.length > 0) {
					each(this.selected, (row) => this.$parent.removeRow(row) );
					this.$parent.clearSelection();
				}
			},

			validate()	{
				let res = this.$refs.form.validate();

				if (this.schema.events && isFunction(this.schema.events.onValidated)) {
					this.schema.events.onValidated(this.model, this.$refs.form.errors, this.schema);
				}

				if (!res) {
					// Set focus to first input with error
					this.$nextTick(() => {
						let el = document.querySelector("div.form tr.error input:nth-child(1)");
						if (el)
							el.focus();
					});
				}

				return res;	
			}

		},

		created() {
		}	
				
	};

</script>

<style lang="scss" scoped>
	@import "../../scss/common/mixins";

	.container {
		padding: 1rem;
	}

	.form {
		margin: 1rem 0;

		@include bgTranslucentDark(0.2);
		border-radius: 8px;

		.buttons {
			max-width: 400px;
			padding: 0.5em;
		}

	}
</style>
