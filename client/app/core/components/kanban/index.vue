<template lang="pug">
	div.drag-container
		ul.drag-list
			li(v-for="board in boards" class="drag-column", :class="{['drag-column-' + board]: true}", :key="board")
				span.drag-column-header
					h2 {{ board.name }}
				div.drag-options
				ul.drag-inner-list(ref="list", :data-status="board")
					li.drag-item(v-for="task in board.children", :data-task-id="task.code", :key="task.code")
						slot(:name="task.name")
							strong {{ task.name }}
							div {{ task.code }}
</template>

<script>
	import dragula from 'dragula';

	export default {
		props: [
			"boards"
			, "tasks"
		]

		, computed: {

		}
		
		, methods: {

		}

		, mounted() {
			dragula(this.$refs.list)
				.on('drag', (el) => {
					el.classList.add('is-moving');
				})
				.on('drop', (task, list) => {
					let index = 0;
					for (index = 0; index < list.children.length; index += 1) {
						if (list.children[index].classList.contains('is-moving')) break;
					}
					this.$emit('update-task', task.dataset.taskId, list.dataset.status, index);
				})
				.on('dragend', (el) => {
					el.classList.remove('is-moving');
					window.setTimeout(() => {
					el.classList.add('is-moved');
					window.setTimeout(() => {
						el.classList.remove('is-moved');
					}, 600);
				}, 100);
			});
		}
	};
</script>
