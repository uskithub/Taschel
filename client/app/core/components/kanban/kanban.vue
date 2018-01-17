<template lang="pug">
	li.kanban-item.card(:class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" @click="select($event, task)")
		slot(:name="task.name")
			strong {{ task.name }}		
			ul.kanban-list(v-if="task.children.length > 0" data-type="task", :data-code="task.code")
				kanban(v-for="child in task.children", :task="child", :key="child.code")
</template>

<script>
	
	export default {
		name: "Kanban"
        , props: [
			"task"
		]
		, computed: {
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