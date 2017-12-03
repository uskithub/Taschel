<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="enabledNew")
				button.button.is-primary(@click="newModel")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
			.right {{ _("SelectedOfAll", { selected: selectedTasks.length, all: tasks.length } ) }}
		br
		data-table(:schema="schema.projectTable", :rows="projects", :order="order", :search="search", :selected="selectedProject", :select="_selectProject", :select-all="selectAll")
		br
		data-table(:schema="schema.taskTable", :rows="tasks", :order="order", :search="search", :selected="selectedTasks", :select="_selectTasks", :select-all="selectAll")

		.form(v-if="model")
			vue-form-generator(:schema='schema.form', :model='model', :options='options', :multiple="selectedTasks.length > 1", ref="form", :is-new-model="isNewModel")

			.errors.text-center
				div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
					strong {{ item.error }}

			.buttons.flex.justify-space-around
				button.button.primary(@click="saveModel", :disabled="!enabledSave")
					i.icon.fa.fa-save 
					| {{ schema.resources.saveCaption || _("Save") }}
				button.button.outline(@click="cloneModel", :disabled="!enabledClone")
					i.icon.fa.fa-copy 
					| {{ schema.resources.cloneCaption || _("Clone") }}
				button.button.danger(@click="deleteModel", :disabled="!enabledDelete")
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

        // task-page(:schema="schema", :selectedProject="selectedProject", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :users="users") に対応させる
		props: [
			"schema"
            , "projects"
			, "tasks"
			, "users"
			, "selectedProject"
			, "selectedTasks"
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
			enabledDelete() { return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },

			validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		},	

		watch: {
			// propsで指定した名前に合わせる必要あり
			// TODO: 値は保持されるのに、画面表示が更新されない不具合あり
			selectedProject() {
				if (!this.isNewModel) {
					if (this.model == null) return;
					if (this.selectedProject.length > 0) {
						this.model.root_code = this.selectedProject[0].code;
					} else {
						this.model.root_code = null
					}
				}
			}

			// propsで指定した名前に合わせる必要あり
			, selectedTask() {
				console.log("●● selectedTask")
				// if (!this.isNewModel)
				// 	this.generateModel();
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

			_selectProject(event, row, add) {
				this.isNewModel = false;

				if (this.selectedProject.length > 0 && this.selectedProject[0] == row) {
					this.$parent.deselectProject();
				} else {
					this.$parent.selectProject(row);
				}
			}
			, _selectTasks(event, row, add) {
				this.isNewModel = false;

				if (this.selectedTasks.length > 0 && this.selectedTasks.includes(row)) {
					this.$parent.deselectTask(row);
				} else {
					if (this.schema.taskTable.multiSelect === true && (add || (event && event.ctrlKey))) {
						this.$parent.selectTasks(row, true);
					} else {
						this.$parent.selectTasks(row, false);
					}
				}
			}
			, selectAll(event) {
				this.isNewModel = false;

				let filter = Vue.filter("filterBy");
				let filteredRows = filter(this.projects, this.search);

				if (this.selected.length < filteredRows.length) {
					// Select all
					this.$parent.selectRow(filteredRows, false);
				} else {
					// Unselect all 
					this.$parent.clearSelection();
				}
			}

			, generateModel() {
				if (this.selected.length == 1) {
					this.model = cloneDeep(this.selected[0]);
				}
				else if (this.selected.length > 1) {
					this.model = schemaUtils.mergeMultiObjectFields(this.schema.form, this.selected);
				}
				else
					this.model = null;
			}

			, newModel() {
				console.log("Create new model...");

				// 動的にユーザー一覧を設定している
				this.schema.form.fields.forEach(f => {
					if (f.model == "asignee_code") {
						f.values = this.users.map(user => {
							return {
								id : user.code
								, name : user.username
							}
						});
					}
				});	
				this.$parent.clearSelection();

				let newRow = schemaUtils.createDefaultObject(this.schema.form);
                this.isNewModel = true;
                
                // projectが設定されている場合、projectを設定
                if (this.selectedProject.length > 0) {
                    let root =  this.selectedProject[0];
					newRow.root_code = root.code;
					newRow.parent_code = root.code;
                }

				this.model = newRow;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			},	

			cloneModel() {
				console.log("Clone model...");
				let baseModel = this.model;
				this.$parent.clearSelection();

				let newRow = cloneDeep(baseModel);
				newRow.id = null;
				newRow.code = null;
				this.isNewModel = true;
				this.model = newRow;
			},

			saveModel() {
				console.log("Save model...");
				if (this.options.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel)
						this.$parent.saveRow(this.model);
					else
						this.$parent.updateRow(this.model);

				} else {
					// Validation error
				}
			},

			deleteModel() {
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
