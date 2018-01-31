<template lang="pug">
	li.kanban-item.card(:class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" @click="select($event, task)")
		slot(:name="task.name")
			.tag(v-if="isDisplayTag") {{ task.root.shortname }}
			strong  {{ task.name }}
			ul.kanban-list(v-if="task.children.length > 0" data-type="task", :class="{'draggable':isDraggable}", :data-code="task.code")
				kanban(v-for="child in task.children", :task="child", :key="child.code")
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
			description(task) {
				return [
					{
						key: "purpose"
						, title: _("Purpose")
						, value: task.purpose
					}
					, {
						key: "goal"
						, title: _("Goal")
						, value: task.goal
					}
				];
			}
			, select(e, task) {
				this.$emit("select", task);
			}
		}
	};
</script>

<style lang="scss" scoped>
    @import "../../../../scss/taschel/kanban";
</style>