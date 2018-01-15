<template lang="pug">
	li.kanban-item.card(:class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" draggable="true"
		@click="select($event, task)"
	)
		slot(:name="task.name")
			strong {{ task.name }}
			div(v-if="task.children && task.children.length > 0" )
				ul.kanban-inner-list
					kanban(v-for="child in task.children", :task="child", :key="child.code")
			div.text-muted(v-else)
				dl(v-for="item in description(task)", :key="item.key")
					dt {{ item.title }}
					dd {{ item.value }}

</template>

<script>

	import $ from 'jquery';
	let _self = null;
	
	export default {
		name: "Kanban"
        , props: [
			"task"
		]
		, data: function () {
            return {
                isDraggingIntoChild: false
                , isOpen: true
            }
        } 
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
    @import "../../../../scss/taschel/kanban2";
</style>