<template lang="pug">
	li.treenode(:draggable="draggable", :key="treenode.id", :data-id="treenode.id", :class="getClass(treenode)" 
		@mouseover.prevent.stop="onMouseover"
		@mouseout.prevent.stop="onMouseout"
		@click="$emit('click', $event, treenode)"
		@dragstart="$emit('dragstart', $event, parent, treenode)"
		@dragend="$emit('dragend', $event, treenode)"
	)
		slot(:name="treenode.name")
			.tree-item
				input.checkbox(type="checkbox")
				span.icon(v-if="treenode.subtrees.length > 0" @click.prevent.stop="$emit('toggle-caret', $event, treenode.id)")
					i.fa(:class="{ 'fa-caret-down': !(foldingConditionMap[treenode.id]===false), 'fa-caret-right': foldingConditionMap[treenode.id]===false }")
				span.treelist-node-header  {{ treenode.name }}
				span.operation(v-show="isHovering")
					span.icon(@click.prevent.stop="$emit('editIconDidPush', $event, treenode)")
						i.fa.fa-edit
					span.icon(@click.prevent.stop="$emit('addIconDidPush', $event, treenode)")
						i.fa.fa-plus
					span.icon(@click.prevent.stop="$emit('addIconDidPush', $event, parent, treenode)")
						i.fa.fa-arrow-right
			ul.treelist(v-if="!(foldingConditionMap[treenode.id]===false)" data-type="treenode", :data-id="treenode.id"
				@dragenter="onDragenter($event, treenode)"
			)
				treenode(v-for="childnode in treenode.subtrees", :parent="treenode", :treenode="childnode", :foldingConditionMap="foldingConditionMap", :key="childnode.id"
					@editIconDidPush="editIconDidPush"
					@addIconDidPush="addIconDidPush"
					@dragstart="onDragstart"
					@dragend="onDragend"
					@dragenter="onDragenter"
					@toggle-caret="caratDidClick"
				)
			ul.treelist(v-else data-type="treelist", :data-id="treenode.id"
				@dragenter="onDragenter($event, treenode)"
			)
</template>

<script>
	import { cloneDeep, isObject } from "lodash";
	
	// Summary:
	//  - kanban corresponds to a task.
	//	- kanbans may contain an other kanban-list.
	
	// Interface:
	//  - kanban emits click events with the task.

	export default {
		name: "Treenode"
        , props: {
			parent: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, treenode: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, foldingConditionMap: {
				type: Object
			}
			, draggable: {
				type: Boolean
				, default: true
			}
		}
		, data() {
			return {
				isHovering: false
			}
		}
        , methods: {
			// for presentation
			getClass(treenode) {
				return treenode.task.type;
			}

            // for interactione
			, onMouseover(e) {
				this.isHovering = true;
			}
			, onMouseout(e) {
				this.isHovering = false;
			}
			, editIconDidPush(e, treenode) {
				this.$emit("editIconDidPush", e, treenode);
				e.stopPropagation();
			}
			, addIconDidPush(e, parent, sibling) {
				this.$emit("addIconDidPush", e, parent, sibling);
				e.stopPropagation();
			}
            , onDragstart(e, parent, treenode) {
				this.$emit("dragstart", e, parent, treenode);
				e.stopPropagation();
			}
			, onDragend(e, treenode) {
				this.$emit("dragend", e, treenode);
				e.stopPropagation();
			}
			, onDragenter(e, treenode) {
				this.$emit("dragenter", e, treenode);
				e.stopPropagation();
			}
			, caratDidClick(e, id) {
				this.$emit("toggle-caret", e, id);
				e.stopPropagation();
			}
        }
	};
</script>

<style lang="scss">
	@import "../assets/style";
</style>
<style scoped>
</style>