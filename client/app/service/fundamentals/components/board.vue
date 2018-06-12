<template lang="pug">
	ul.kanban-board-container.content.card-columns
		li.kanban-board(v-for="board in boards", :key="board.code")
			span.kanban-board-header
				legend {{ board.name }}
			div.drag-options
			ul.kanban-list.draggable(:data-code="board.code")
				kanban(v-for="task in board.tasks", :task="task", :key="task.code", :isDisplayShortname="true", :isDraggable="board.type=='kanban'||board.code=='UNCLASSIFIED'")
</template>
<script>
	import Kanban from "./kanban.vue";
	import dragula from "dragula";

    let drake = null;

	export default {
		name: "Board"
		, components: {
			Kanban
		}
        , props: {
			boards : {
				type: Array
				, validator: (value) => { return true; } // TODO
			}
		}
		, computed: {
		}
		, updated() {
			this.$nextTick(() => {
				this.makeDraggable();
			});
		}
		, mounted() {
			this.$nextTick(() => {
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
				let kanbanList = Array.from(document.querySelectorAll(".kanban-list.draggable"), el => { return el; });
				
				drake = dragula(kanbanList)
					.on("drag", (el, source) => {
						console.log("● draggin ", el);
						el.classList.add("is-moving");
					})
					.on("drop", (el, target, source, sibling) => {
						let index = 0;
						for (; index < target.tasks.length; index += 1) {
							if (target.tasks[index].classList.contains("is-moving")) 
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
	@import "../../../../scss/v2/kanban";
</style>