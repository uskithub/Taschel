<template lang="pug">
	.container
		h3.title {{ schema.title }}

		data-table(:schema="schema.projectTable", :rows="projects", :order="order", :search="search", :selected="selectedProject", :select="_selectProject", :select-all="selectAll")
		br
		tree-list(:isRoot="true", :node="selectedProject.length > 0 ? selectedProject[0] : null")

</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import DataTable from "./dataTable.vue";
    import TreeList from "./components/treelist/index";

	import { each, find, cloneDeep, isFunction } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
			DataTable
            , TreeList
		},

		props: [
			"schema"
			, "projects"
			, "selectedProject"
		]

		, data() {
			return {
				order: {
					field: "id",
					direction: 1
				},

				model: null,
				isNewModel: false
            };
		}

		, computed: {
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
		}

		, watch: {
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
		}

		, methods: {

			_selectProject(event, row, add) {
				this.isNewModel = false;

				if (this.selectedProject.length > 0 && this.selectedProject[0] == row) {
					this.$parent.deselectProject();
				} else {
					this.$parent.selectProject(row);
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
			
			, addNode() {
                var node = new TreeNode('new node', false)
                if (!this.data.children) this.data.children = []
                this.data.addChildren(node)
            }
            , getNewTree() {
                const vm = this
                function _dfs (oldNode) {
                    let newNode = {}

                    newNode.name = oldNode.name
                    newNode.pid = oldNode.pid
                    newNode.isLeaf = oldNode.isLeaf
                    newNode.id = oldNode.id

                    if (oldNode.children && oldNode.children.length > 0) {
                        newNode.children = []
                        for (let i = 0, len = oldNode.children.length; i < len; i++) {
                            newNode.children.push(_dfs(oldNode.children[i]))
                        }
                    }
                    return newNode
                }
                vm.newTree = _dfs(vm.data)
            }

            // for gant
            , move(moveContext) {
                this.$parent.move(moveContext);
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
