<template lang="pug">
	li.treenode(:draggable="draggable", :key="treenode.id", :data-id="treenode.id"
		@click="$emit('click', $event, treenode)"
		@dragstart="$emit('dragstart', $event, treenode)"
		@dragend="$emit('dragend', $event, treenode)"
	)
		slot(:name="treenode.name")
			.media-content
				strong  {{ treenode.name }}
				ul.treelist(v-if="treenode.treelist !== undefined && treenode.treelist.length > 0" data-type="treenode", :data-id="treenode.id")
					treenode(v-for="childnode in treenode.subtree", :kanban="childnode", :key="childnode.id"
						@dragstart="ondragstart"
						@dragend="ondragend"
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
			treenode: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, draggable: {
				type: Boolean
				, default: true
			}
		}
        , methods: {
            ondragstart(e, kanban) {
				this.$emit("dragstart", e, kanban);
				e.stopPropagation();
			}
			, ondragend(e, kanban) {
				this.$emit("dragend", e, kanban);
				e.stopPropagation();
			}
        }
	};
</script>

<style lang="scss">
	@import "../assets/style";
</style>