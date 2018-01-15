<template lang="pug">
	div
		ul.kanban-container(v-for="group in boardGroups", :key="group.name")
			li.kanban-board(v-for="board in group.boards", :key="board.code")
				span.kanban-header
					legend {{ board.name }}
				.drag-options
				ul.kanban-list(ref="boards", :data-code="board.code")
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

				let containers = this.$refs.boards;//.concut(document.querySelectorAll(".kanban-list .kanban-inner-list"));
				
				drake = dragula(containers)
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
						// this.$emit("arrange", { moving: li.dataset.code
						// 	, from: previousBoardCode
						// 	, to: ul.dataset.code
						// 	, index: index 
						// });
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
    @import "../../../../scss/taschel/kanban2";
</style>