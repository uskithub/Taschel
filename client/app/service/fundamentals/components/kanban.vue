<template lang="pug">
	li.kanban-item.media(:class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" @click="select($event, task)")
		slot(:name="task.name")
			.media-content
				.tag(v-if="isDisplayTag") {{ task.root.shortname }}
				strong  {{ task.name }}
				ul.kanban-list(v-if="task.children.length > 0" data-type="task", :class="{'draggable':isDraggable}", :data-code="task.code")
					kanban(v-for="child in task.children", :task="child", :key="child.code")
			.media-right(v-if="!isDraggable")
				a.close(title="Close" @click="off($event, task)")
</template>

<script>
	import { cloneDeep, isObject } from "lodash";
	
	export default {
		name: "Kanban"
        , props: {
			task: {
				type: Object
				, validator: function(value) { return true; } // TODO
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
		, methods : {
			select(e, task) {
				this.$emit("select", task);
			}
			, off(e, task) {
				// TODO
				console.log("●", task);
			}
		}
	};
</script>

<style lang="scss" scoped>
    @import "../../../../scss/taschel/kanban";
</style>