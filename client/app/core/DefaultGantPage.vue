<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.form
			vue-form-generator(:schema="projectSelector", :model="modelProjectSelector", ref="projectSelector", @model-updated="modelUpdated")

		tree-list(:isRoot="true", :node="selectedProjectChildren")

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

				// 選択したプロジェクトが格納される
				, modelProjectSelector:  {
					code : this.selectedProject
				}
            };
		}

		, computed: {
			...mapGetters("session", {
				search: "searchText"
			})
			
			, selectedProjectChildren() {
				if (this.modelProjectSelector.code) {
					for (let i in this.projects) {
						let project = this.projects[i];
						if (project.code == this.modelProjectSelector.code) {
							return project;
						}
					}
				}
				return null;
			}
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
			enabledBreakdown() 	{ return (this.model && !this.isNewModel && this.options.enabledBreakdownButton !== false); },
			enabledDelete() { return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },

			validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		}

		, watch: {
		}

		, methods: {
			modelUpdated(newVal, schema) {
				console.log(`● ${schema}: ${newVal}`);
				if (newVal) {
					this.$parent.selectProject(newVal);
				} else {
					this.$parent.deselectProject();
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
            , arrange(context) {
                this.$parent.arrange(context);
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
