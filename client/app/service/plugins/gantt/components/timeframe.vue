<template lang="pug">
	li.treenode(:draggable="draggable", :key="timeframe.id", :data-id="timeframe.id"
		@click="$emit('click', $event, timeframe)"
		@dragstart="$emit('dragstart', $event, timeframe)"
		@dragend="$emit('dragend', $event, timeframe)"
	)
		slot(:name="timeframe.name")
			.tree-item
				legend 
</template>

<script>
	import { cloneDeep, isObject } from "lodash";
	
	// Summary:
	//  - kanban corresponds to a task.
	//	- kanbans may contain an other kanban-list.
	
	// Interface:
	//  - kanban emits click events with the task.

	export default {
		name: "Timeframe"
        , props: {
			timeframe: {
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
        , methods: {
            ondragstart(e, timeframe) {
				this.$emit("dragstart", e, timeframe);
				e.stopPropagation();
			}
			, ondragend(e, timeframe) {
				this.$emit("dragend", e, timeframe);
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