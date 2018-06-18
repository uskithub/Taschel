
<template lang="pug">
	li.kanban-item(:draggable="draggable", :key="kanban.id" 
		@click="$emit('click', $event, kanban)"
		@dragstart="$emit('dragstart', $event, kanban)"
		@dragend="$emit('dragend', $event, kanban)"
	)
		slot(:name="kanban.name")
			.media-content
				strong  {{ kanban.name }}
				ul.kanban-list(v-if="kanban.kanbans !== undefined && kanban.kanbans.length > 0" data-type="kanban", :data-id="kanban.id")
					kanban(v-for="child in kanban.kanbans", :kanban="child", :key="child.id"
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
		name: "Kanban"
        , props: {
			kanban: {
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