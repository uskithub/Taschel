<template lang="pug">
	li.media.kanban-item(:draggable="draggable", :key="kanban.id", :data-id="kanban.id"
		@click="$emit('click', $event, kanban)"
		@dragstart="$emit('dragstart', $event, parent, kanban)"
		@dragend="$emit('dragend', $event, kanban)"
	)
		.media-content
			.tag(v-if="isDisplayTag && kanban.tag != null") {{ kanban.tag }}
			strong(:class="kanban.styleClass") {{ kanban.name }}
			slot(name="kanban", :content="kanban.content", :isTopLevel="true")
			ul.kanban-list(v-if="kanban.kanbans !== undefined && kanban.kanbans.length > 0" data-type="kanban", :data-id="kanban.id"
				@dragenter="onDragenter($event, kanban)"
			)
				kanban(v-for="child in kanban.kanbans", :parent="kanban", :kanban="child", :key="child.id"
					@dragstart="onDragstart"
					@dragend="onDragend"
					@dragenter="onDragenter"
				)
					template(v-slot:kanban="slotProps")
						slot(name="kanban", :content="slotProps.content", :isTopLevel="false")
		.media-right(v-if="removable")
			a.close(title="Remove" @click="$emit('remove', $event, parent, kanban)")
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
			parent: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, kanban: {
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
			, isTopLevel: {
				type: Boolean
				, default: false
			}
			, isDisplayTag: {
				type: Boolean
				, default: false
			}
			, removable: {
				type: Boolean
				, default: false
			}
		}
        , methods: {
            onDragstart(e, parent, kanban) {
				this.$emit("dragstart", e, parent, kanban);
				e.stopPropagation();
			}
			, onDragend(e, kanban) {
				this.$emit("dragend", e, kanban);
				e.stopPropagation();
			}
			, onDragenter(e, kanban) {
				this.$emit("dragenter", e, kanban);
				e.stopPropagation();
			}
        }
	};
</script>
<style lang="scss">
	@import "../assets/style";
</style>