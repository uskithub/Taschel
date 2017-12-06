<template lang="pug">
	.container
		h3.title {{ schema.title }}

		vue-tree-list(:model="data" default-tree-node-name="new node" default-leaf-node-name="new leaf")

</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
    import { VueTreeList, Tree, TreeNode } from "./components/treeList";
    // import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'

	import { each, find, cloneDeep, isFunction } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
            VueTreeList
		},

		props: [
			"schema",
			"selected",
			"rows"
		],

		data() {
            return {
                newTree: {},
                data: new Tree([
                    {
                        name: 'Node 1',
                        id: 1,
                        pid: 0,
                        children: [
                            {
                                name: 'Node 1-2',
                                id: 2,
                                isLeaf: true,
                                pid: 1
                            }
                        ]
                    }
                    , {
                        name: 'Node 2',
                        id: 3,
                        pid: 0
                    }
                    , {
                        name: 'Node 3',
                        id: 4,
                        pid: 0
                    }
                ])
            }
		},

		// computed: {
		// 	...mapGetters("session", {
		// 		search: "searchText"
		// 	}),

		// 	options() 		{ return this.schema.options || {};	},

		// 	enabledNew() 	{ return (this.options.enableNewButton !== false); },
		// 	enabledSave() 	{ return (this.model && this.options.enabledSaveButton !== false); },
		// 	enabledClone() 	{ return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },
		// 	enabledBreakdown() 	{ return (this.model && !this.isNewModel && this.options.enabledBreakdownButton !== false); },
		// 	enabledDelete() { return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },

		// 	validationErrors() {
		// 		if (this.$refs.form && this.$refs.form.errors) 
		// 			return this.$refs.form.errors;

		// 		return [];
		// 	}
		// },	

		watch: {
			// selected() {
			// 	if (!this.isNewModel)
			// 		this.generateModel();
			// }

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

			addNode() {
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
