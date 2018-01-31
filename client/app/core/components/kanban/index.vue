<template lang="pug">
	.kanban-system-container
		ul.kanban-board-container.content.card-columns(v-for="group in boardGroups", :key="group.name")
			li.kanban-board(v-for="board in group.boards", :key="board.code")
				span.kanban-board-header
					legend {{ board.name }}
				div.drag-options
				ul.kanban-list(data-type="group", :data-code="board.code")
					kanban(v-for="task in board.children", :task="task", :key="task.code", :isDisplayShortname="true")
</template>

<script>
	import Kanban from "./kanban.vue";
	import dragula from "dragula";
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
			this.$nextTick(function () {
				this.makeDraggable();
			});
		}
		, mounted() {
			this.$nextTick(function () {
				this.makeDraggable();
			});
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
				let kanbanList = Array.from(document.querySelectorAll(".kanban-list"), el => { return el; });
				
				drake = dragula(kanbanList)
					.on("drag", (el, source) => {
						console.log("● draggin ", el);
						el.classList.add("is-moving");
					})
					.on("drop", (el, target, source, sibling) => {
						let index = 0;
						for (; index < target.children.length; index += 1) {
							if (target.children[index].classList.contains("is-moving")) 
								break;
						}
						console.log("● dropped", el.dataset.code, target.dataset.code, source.dataset.code, index)
						this.$emit("arrange", { moving: { type: "task", code: el.dataset.code }
							, from: { type: source.dataset.type, code: source.dataset.code }
							, to: { type: target.dataset.type, code: target.dataset.code }
							, index: index 
						});
					})
					.on("dragend", el => {
						el.classList.remove("is-moving");
						window.setTimeout(() => {
							el.classList.add("is-moved");
							window.setTimeout(() => {
								el.classList.remove("is-moved");
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