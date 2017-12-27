<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.form
			vue-form-generator(:schema="schema.projectSelector", :model="modelProjectSelector", ref="projectSelector", @model-updated="selectProject")

		tree-list(v-if="selectedProject", :isRoot="true", :node="rootNode", :add="buttonAddDidPush")

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
	import TreeList from "./components/treelist/index";
	import PopupForm from "./components/popupform";

	import { each, find, cloneDeep, isFunction } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		components: {
			DataTable
			, TreeList
			, PopupForm
		}
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
					field: "id"
					, direction: 1
				}
				// 選択したプロジェクトが格納される
				, modelProjectSelector:  {
					code : this.currentProject
				}
            };
		}

		, computed: {
			...mapGetters("gantPage", [
				"targetNode"
			])
			, rootNode() {
				if (this.selectedProject) {
					for (let i in this.projects) {
						let p = this.projects[i];
						if (p.code == this.selectedProject) {
							return p;
						}
					}
				}
				return null;
			}
			, isEditing() { return this.model != null; }
		}

		, watch: {
		}

		, methods: {
			selectProject(newVal, schema) {
				console.log(`● ${schema}: ${newVal}`);
				this.$emit("select-project", newVal);
			}
            , arrange(context) {
                this.$emit("arrange", context);
			}
            , buttonAddDidPush(e, node) {
				this.$emit("add", node);

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

			, addNode() {
                let node = new TreeNode("new node", false);
                if (!this.data.children) this.data.children = [];
                this.data.addChildren(node);
            }
            , getNewTree() {
                const vm = this;
                function _dfs (oldNode) {
                    let newNode = {};

                    newNode.name = oldNode.name;
                    newNode.pid = oldNode.pid;
                    newNode.isLeaf = oldNode.isLeaf;
                    newNode.id = oldNode.id;

                    if (oldNode.children && oldNode.children.length > 0) {
                        newNode.children = [];
                        for (let i = 0, len = oldNode.children.length; i < len; i++) {
                            newNode.children.push(_dfs(oldNode.children[i]));
                        }
                    }
                    return newNode;
                }
                vm.newTree = _dfs(vm.data);
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
