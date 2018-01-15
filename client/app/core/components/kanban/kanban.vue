<template lang="pug">
	li.kanban-item.card(:class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" @click="select($event, task)")
		slot(:name="task.name")
			strong {{ task.name }}
			div(v-if="task.children && task.children.length > 0" )
				ul.kanban-list
					kanban(v-for="child in task.children", :task="child", :key="child.code")
			//- div.text-muted(v-else)
			//- 	dl(v-for="item in description(task)", :key="item.key")
			//- 		dt {{ item.title }}
			//- 		dd {{ item.value }}
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

    li.drag-item.card {
        li.drag-item.card {
            margin: 4px 0;
        }
    }
</style>