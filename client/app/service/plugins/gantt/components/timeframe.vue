<template lang="pug">
	li.treenode(:draggable="draggable", :key="timeframe.id", :data-id="timeframe.id"
		@click="$emit('click', $event, timeframe)"
		@dragstart="$emit('dragstart', $event, timeframe)"
		@dragend="$emit('dragend', $event, timeframe)"
	)
		slot(:name="timeframe.name")
			.media-content
				legend 
				ul.treelist(v-show="!(foldingConditionMap[timeframe.id]===false)" data-type="timeframe", :data-id="timeframe.id")
					timeframe(v-for="childnode in timeframe.subtree", :timeframe="childnode", :foldingConditionMap="foldingConditionMap", :key="childnode.id"
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
	.vue-gantt-legend {
		flex-shrink: 0;
		width: 225px;
		overflow: hidden;
		box-sizing: border-box;
		border: 1px solid #DDD;
		border-bottom: none;
		position: relative;
		z-index: 20;
	}

	.vue-gantt-legend .title {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 72px;
		box-sizing: border-box;
		border-bottom: 1px solid #DDD;
	}

	.vue-gantt-legend .task {
		line-height: 24px;
		box-sizing: border-box;
		border-bottom: 1px solid #DDD;
		cursor: pointer;
		height: 24px;
		margin: 0;
		width: 100%;
	}

	.vue-gantt-legend .task .task-name {
		font-weight: bold;
		padding: 0 10px;
	}
</style>