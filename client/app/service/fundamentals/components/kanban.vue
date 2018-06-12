<template lang="pug">
	li.kanban-item(:data-code="task.code", :key="task.code" @click="$emit('click', $event, task)")
		slot(:name="task.name")
			.media-content
				.tag(v-if="isDisplayTag") {{ task.root.shortname }}
				strong  {{ task.name }}
				ul.kanban-list(v-if="task.tasks.length > 0" data-type="task", :class="{'draggable':isDraggable}", :data-code="task.code")
					kanban(v-for="child in task.tasks", :task="child", :key="child.code")
			.media-right(v-if="!isDraggable")
				a.close(title="Close" @click="$emit('close', $event, task)")
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
			task: {
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
				return this.isDisplayShortname && isObject(this.task.root) && this.task.root.shortname != null;
			}
		}
	};
</script>

<style lang="scss">
	@import "../../../../scss/v2/kanban";
</style>