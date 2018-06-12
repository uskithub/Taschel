// TODO: このcomponentでtaskが出てくるのはおかしい → なくす
<template lang="pug">
	li.kanban-item(:data-code="kanban.code", :key="kanban.code" @click="$emit('click', $event, kanban)")
		slot(:name="kanban.name")
			.media-content
				.tag(v-if="isDisplayTag") {{ kanban.root.shortname }}
				strong  {{ kanban.name }}
				ul.kanban-list(v-if="kanban.tasks.length > 0" data-type="kanban", :class="{'draggable':isDraggable}", :data-code="kanban.code")
					kanban(v-for="child in kanban.tasks", :kanban="child", :key="child.code")
			.media-right(v-if="!isDraggable")
				a.close(title="Close" @click="$emit('close', $event, kanban)")
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
				, validator: (value) => { return true; } // TODO
			}
			, isDisplayShortname: {
				type: Boolean
				, default: false
			}
			, isDraggable : {
				type: Boolean
				, default: true
			}
		}
		, computed: {
			isDisplayTag() {
				return this.isDisplayShortname && isObject(this.kanban.root) && this.task.root.shortname != null;
			}
		}
	};
</script>

<style lang="scss">
	@import "../../../../scss/v2/kanban";
</style>