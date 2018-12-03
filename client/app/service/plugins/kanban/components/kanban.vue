<template lang="pug">
	li.kanban-item(:draggable="draggable", :key="kanban.id", :data-id="kanban.id"
		@click="$emit('click', $event, kanban)"
		@dragstart="$emit('dragstart', $event, parent, kanban)"
		@dragend="$emit('dragend', $event, kanban)"
	)
		slot(:name="kanban.name")
			.media-content
				.tag(v-if="isDisplayTag") {{ kanban.task.root.shortname }}
				strong  {{ kanban.name }}
				ul.kanban-list(v-if="kanban.kanbans !== undefined && kanban.kanbans.length > 0" data-type="kanban", :data-id="kanban.id"
					@dragenter="ondragenter($event, kanban)"
				)
					kanban(v-for="child in kanban.kanbans", :parent="kanban", :kanban="child", :key="child.id"
						@dragstart="ondragstart"
						@dragend="ondragend"
						@dragenter="ondragenter"
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
			, isDisplayShortname: {
				type: Boolean
				, default: false
			}
		}
		, computed: {
			isDisplayTag() {
				//console.log("this.isDisplayShortname:", this.isDisplayShortname);
				//console.log("this.kanban.task.root:", this.kanban.task.root);
				return this.isDisplayShortname && this.kanban.task.root && this.kanban.task.root.shortname != null;
			}
		}
        , methods: {
            ondragstart(e, parent, kanban) {
				this.$emit("dragstart", e, parent, kanban);
				e.stopPropagation();
			}
			, ondragend(e, kanban) {
				this.$emit("dragend", e, kanban);
				e.stopPropagation();
			}
			, ondragenter(e, kanban) {
				this.$emit("dragenter", e, kanban);
				e.stopPropagation();
			}
        }
	};
</script>

<style lang="scss">
	@import "../assets/style";
</style>