<template lang="pug">
	div.drag-container
		ul.drag-list.content.card-columns
			li(v-for="board in boards" class="drag-column", :class="{['drag-column-' + board.code]: true}", :key="board.code")
				span.drag-column-header
					legend {{ board.name }}
				div.drag-options
				ul.drag-inner-list(ref="boards", :data-code="board.code")
					li.drag-item.card(v-for="task in board.children", :class="{'requirement': task.type=='requirement', 'way': task.type=='way', 'step': task.type=='step'}", :data-code="task.code", :key="task.code" @click="select($event, task)")
						.block(:name="task.name")
							.title {{ task.name }}
							p

						.block 
							small.text-muted {{ task.code }}
</template>

<script>
	import dragula from "dragula";
	let previousBoardCode = null;
	let drake = null;

	export default {
		props: [
			"boards"
			, "tasks"
		]

		, computed: {

		}

		, updated() {
			this.makeDraggable();
		}

		, mounted() {
			this.makeDraggable();
		}
		, methods : {
			makeDraggable() {
				if (drake) {
					drake.destroy();
				}
				drake = dragula(this.$refs.boards)
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
						this.$emit("arrange", { moving: li.dataset.code
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
			, select(e, task) {
				this.$emit("select", task);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.drag-item {
		&.card {
			display: block;
			width: inherit;
			margin: 0.5em;
			padding: 0.5em;

			.block {
				padding: 0;
			}

			.title {
				font-size: 1rem;
			}
		}
		&.requirement {
			border: 1px solid #7f1414;
		}

		&.way {
			border: 1px solid #866112;
		}

		&.step {
			border: 1px solid #176e2b;
		}

	}
</style>