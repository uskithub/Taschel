<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="isAddButtonEnable")
				button.button.is-primary(@click="buttonAddDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
			.right {{ _("SelectedOfAll", { selected: selectedTasks.length, all: tasks.length } ) }}
		br
		.form
			vue-form-generator(:schema="schema.projectSelector", :model="modelProjectSelector", ref="projectSelector", @model-updated="selectProject")

		data-table(v-if="selectedProject", :schema="schema.table", :rows="tasks", :order="order", :search="search", :selected="selectedTasks", :select="select", :select-all="selectAll")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			, @save="save"
			, @clone="clone"
			, @breakdown="breakdown"
			, @remove="remove"
			, @cancel="cancel"
		)
</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import DataTable from "./dataTable.vue";
	import PopupForm from "./components/popupform";

	import { each, find, cloneDeep, isFunction } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
			DataTable
			, PopupForm
		}

        // task-page(:schema="schema", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :me="me") に対応させる
		, props: {
			schema: {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, projects: {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, tasks: {
				type: Array
				, validator: function(value) { return true; } // TODO
			}
			, selectedTasks: {
				type: Array
				, validator: function(value) { return true; } // TODO
			}
			, selectedProject: {
				type: String
				, validator: function(value) { return true; } // TODO
			}
			, model : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
		}

		, data() {
			return {
				order: {
					field: "id",
					direction: 1
				}
				// 選択したプロジェクトが格納される
				, modelProjectSelector: {
					code : this.selectedProject
				}
			};
		}
		, computed: {
			...mapGetters("session", {
				search: "searchText"
			})
			, options() { return this.schema.popupForm.options || {}; }
			, isAddButtonEnable() { return this.options.isAddButtonEnable !== false; }
			, isEditing() {
				return this.model != null || this.selectedTasks.length > 0;
			}
		}
		, watch: {
			// 呼ばれるけど、初めしか値が変わらない
			// , modelProjectSelector(model) {
			// 	console.log("●", model);	
			// }
		}
		, methods: {
			selectProject(newVal, schema) {
				console.log(`● ${schema}: ${newVal}`);
				this.$emit("select-project", newVal);
			}
			, select(event, row, add) {
				this.$emit("select", row);
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

			, buttonAddDidPush() {
				this.$emit("add");

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}
			, save(model) { this.$emit("save", model); }
			, clone() { this.$emit("clone"); }
			, breakdown() { this.$emit("breakdown"); }
			, remove() { this.$emit("remove"); }		// deleteは予約語なので怒られる
			, cancel() { this.$emit("cancel"); }
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
			padding: 0.5em;
		}

	}
</style>
