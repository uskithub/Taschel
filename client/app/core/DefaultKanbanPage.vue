<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="enabledNew")
				button.button.is-primary(@click="buttonNewDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
			.right {{ _("SelectedOfAll", { selected: selectedTasks.length, all: tasks.length } ) }}
		br
		.form
			vue-form-generator(:schema="projectSelector", :model="modelProjectSelector", ref="projectSelector", @model-updated="modelUpdated")

		kanban(:boards="groups", :tasks="tasks",  @update-handler="arrange")

		.form(v-if="model")
			vue-form-generator(:schema='schema.form', :model='model', :options='options', :multiple="selectedTasks.length > 1", ref="form", :is-new-model="isNewModel")

			.errors.text-center
				div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
					strong {{ item.error }}

			.buttons.flex.justify-space-around
				button.button.primary(@click="buttonSaveDidPush", :disabled="!enabledSave")
					i.icon.fa.fa-save 
					| {{ schema.resources.saveCaption || _("Save") }}
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
    import Kanban from "./components/kanban/index";

	import { each, find, cloneDeep, isFunction, debounce } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
			DataTable
            , Kanban
		},

        // task-page(:schema="schema", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :users="users") に対応させる
		props: [
			"schema"
			, "projects"
			, "groups"
			, "tasks"
			, "users"
			, "selectedTasks"
        ]

		, data() {
			return {
				order: {
					field: "id",
					direction: 1
				},
				model: null,
				isNewModel: false

				// 選択したプロジェクトが格納される
				, modelProjectSelector: {}
            };
        },

		computed: {
			...mapGetters("session", {
				search: "searchText"
			})

			, projectSelector() {
				this.schema.projectSelector.fields.forEach(f => {
					if (f.model == "code") {
						f.values = this.projects.map(project => {
							return {
								id : project.code
								, name : project.name
							}
						});
					}
				});	
				return this.schema.projectSelector;
			}

			, options() 		{ return this.schema.options || {};	},

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
			selectedTask() {
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
			modelUpdated(newVal, schema) {
				console.log(`● ${schema}: ${newVal}`);
				if (newVal) {
					this.$parent.selectProject(newVal);
				} else {
					this.$parent.deselectProject();
				}
			}
			// TODO: ネーミング気になる。統一感がないのでどうにかする
            , arrange(context) {
				this.$parent.arrange(context);
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

			, buttonNewDidPush() {
				console.log("Create new model...");

				let newRow = schemaUtils.createDefaultObject(this.schema.form);
                this.isNewModel = true;
                
                // projectが設定されている場合、projectを設定
                if (this.modelProjectSelector.code) {
                    newRow.parent_code = this.modelProjectSelector.code;
                }

				this.model = newRow;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}
			, buttonSaveDidPush() {
				console.log("Save model...");
				if (this.options.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel)
						this.$parent.createModel(this.model);
					else
						this.$parent.updateModel(this.model);

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
			, buttonDeleteDidPush() {
				if (this.selected.length > 0) {
					each(this.selected, (row) => this.$parent.deleteModel(row) );
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

<style lang="scss">
    @import "../../scss/common/mixins";
    @import "../../scss/kanban.scss";

    $on-hold: #FB7D44;
    $in-progress: #2A92BF;
    $needs-review: #F4CE46;
    $approved: #00B961;

    * {
    	box-sizing: border-box;
    }

    body {
    	background: #33363D;
    	color: white;
    	font-family: 'Lato';
    	font-weight: 300;
    	line-height: 1.5;
    	-webkit-font-smoothing: antialiased;
    }

    .drag-column {
        &-on-hold {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $on-hold;
            }
        }

        &-in-progress {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $in-progress;
            }
        }

        &-needs-review {
            .drag-column-header,
            .is-moved,
            .drag-options{
                background: $needs-review;
            }
        }

        &-approved {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $approved;
            }
        }
    }

    .section {
    	padding: 20px;
    	text-align: center;

    	a {
    		color: white;
    		text-decoration: none;
    		font-weight: 300;
    	}

    	h4 {
    		font-weight: 400;
    		a {
    			font-weight: 600;
    		}
    	}
    }

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
