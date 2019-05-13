<template lang="pug">
	gantt(:treenodes="treenodes", :data="data"
		@addTopLevel="$emit('addTopLevel', $event)"
		@arrange="didArrangeTask"
		@edit="editIconDidPush"
		@add="addIconDidPush"
	)
</template>

<script>
	import Vue from "vue";
	import AbstractView from "system/mixins/abstractView";

	import Treenode from "service/domain/entities/treenode";
	
	import { mapGetters } from "vuex";
	import moment from "moment";
	
	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
		, props: {
			data : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
        }
		, computed : {
			...mapGetters([
				"projects"
				, "currentProject"
			])
			, treenodes() {
				if (this.currentProject !== null) {
					return this.currentProject.tasks.map(t => {
						return new Treenode(t);
					});
				} else {
					return [];
				}
			}
		}
		, data() {
			return {
				parentEntity: null
				, presuppositionalSiblingEntity: null
				, taskTree: null
			};
		}
		, methods : {
			// UI Operations
			didArrangeTask({ treenode, from, to, index }) {
				this.$emit("arrange", treenode, from, to, index);
			}
			, editIconDidPush(e, treenode) {
				this.$emit("edit", treenode);
			}
			, addIconDidPush(e, parent, sibling) {
				this.$emit("add", parent, sibling);
			}
		}
		
	};
</script>
<style lang="scss" scoped></style>