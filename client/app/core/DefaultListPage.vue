<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="isNewButtonEnable")
				button.button.is-primary(@click="buttonNewDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
			.right {{ _("SelectedOfAll", { selected: selected.length, all: rows.length } ) }}
		br
		data-table(:schema="schema.table", :rows="rows", :order="order", :search="search", :selected="selected", :select="select", :select-all="selectAll")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :me="me", :selected="selected"
			, :save-model="saveModelWrapper"
			, :update-model="updateModelWrapper"
			, :delete-model="deleteModelWrapper"
			, :end-editing="endEditing"
		)
</template>

<script>
	import Vue from "vue";
	import DataTable from "./dataTable.vue";
	import PopupForm from "./components/popupform";

	import { each, find, cloneDeep, isFunction } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
			DataTable
			, PopupForm
		}
		, props: {
			schema : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, me : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, selected : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, rows : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, saveModel : {
				type: Function
				, required: true
			}
			, updateModel : {
				type: Function
				, required: true
			}
			, deleteModel : {
				type: Function
				, required: true
			}
			, clearSelection : {
				type: Function
				, required: true
			}
		}
		, data() {
			return {
				order: {
					field: "id"
					, direction: 1
				}
				, isEditingNewModel : false
			};
		}

		, computed: {
			...mapGetters("session", {
				search: "searchText"
			})
			, options() { return this.schema.popupForm.options || {}; }
			, isNewButtonEnable() { return this.options.isNewButtonEnable !== false; }
			, isEditing() {
				return this.isEditingNewModel || this.selected.length > 0;
			}
		}

		, watch: {
			selected() {
				
			}

			/*
			model: {
				handler: function(newVal, oldVal) {
					if (newVal === oldVal) // call only if a property changed, not the model
						console.log("Model property changed!");
				},
				deep: true
			}*/
		}
		
		, methods: {

			saveModelWrapper(model) {
				this.isEditingNewModel = false;
				this.clearSelection();
				this.saveModel(model);
			}

			, updateModelWrapper(model) {
				this.clearSelection();
				this.updateModel(model);
			}

			, deleteModelWrapper(model) {
				this.clearSelection();
				this.deleteModel(model);
			}

			, select(event, row, add) {
				if (this.schema.table.multiSelect === true && (add || (event && event.ctrlKey))) {
					this.$parent.selectRow(row, true);
				} else {
					this.$parent.selectRow(row, false);
				}
			}

			, selectAll(event) {
				let filter = Vue.filter("filterBy");
				let filteredRows = filter(this.rows, this.search);

				if (this.selected.length < filteredRows.length) {
					// Select all
					this.$parent.selectRow(filteredRows, false);
				} else {
					// Unselect all 
					this.clearSelection();
				}
			}

			, buttonNewDidPush() {
				console.log("Create new model...");

				this.clearSelection();
				this.isEditingNewModel = true;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}

			, endEditing() {
				this.isEditingNewModel = false;
				this.clearSelection();
			}
		}

		, created() {
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
