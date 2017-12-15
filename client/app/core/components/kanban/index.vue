<template lang="pug">
	div.drag-container
		ul.drag-list
			li(v-for="board in boards" class="drag-column", :class="{['drag-column-' + board.code]: true}", :key="board.code")
				span.drag-column-header
					h2 {{ board.name }}
				div.drag-options
				ul.drag-inner-list(ref="boards", :data-code="board.code")
					li.drag-item(v-for="task in board.children", :data-code="task.code", :key="task.code")
						slot(:name="task.name")
							strong {{ task.name }}
							div {{ task.code }}
</template>

<script>
	import dragula from 'dragula';
	let previousBoardCode = null;

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
			dragula(this.$refs.boards)
				.on("drag", (li, ul) => {
					previousBoardCode = ul.dataset.code;
					li.classList.add("is-moving");
				})
				.on("drop", (li, ul) => {
					let index = 0;
					for (; index < ul.children.length; index += 1) {
						if (ul.children[index].classList.contains("is-moving")) 
							break;
					}
					this.$emit("update-handler", { moving: li.dataset.code
						, from: previousBoardCode
						, to: ul.dataset.code
						, index: index 
					});
				})
				.on("dragend", (li) => {
					previousBoardCode = null;
					li.classList.remove("is-moving");
					window.setTimeout(() => {
						li.classList.add("is-moved");
						window.setTimeout(() => {
							li.classList.remove("is-moved");
						}, 600);
					}, 100);
				});
		}
	};
</script>
