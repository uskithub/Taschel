<template lang="pug">
	div.drag-container
		ul.drag-list.content.card-columns(v-for="group in boardGroups", :key="group.name")
			li(v-for="board in group.boards" class="drag-column", :class="{['drag-column-' + board.code]: true}", :key="board.code")
				span.drag-column-header
					legend {{ board.name }}
				div.drag-options
				ul.drag-inner-list(ref="boards", :data-code="board.code")
					kanban(v-for="task in board.children", :task="task", :key="task.code")
</template>

<script>
	import Kanban from "./kanban.vue";
	import dragula from "dragula";
	let previousBoardCode = null;
	let drake = null;

	export default {
		name: "KanbanBoard"
		, components: {
			Kanban
		}
        , props: [
			"boardGroups"
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
			, makeDraggable() {
				if (drake) {
					drake.destroy();
				}
				drake = dragula(this.$refs.boards)
					.on("drag", (li, ul) => {
						console.log("● draggin ", li);
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
    @import "../../../../scss/taschel/kanban";
</style>