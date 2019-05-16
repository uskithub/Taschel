<template lang="pug">
	.kanban-system-container
		ul.kanban-board-container(v-for="board in boards", :key="board.name")
			kanban-layer(v-for="layer in board.layers", :layer="layer", :key="layer.id"
				@dragstart="onDragstart"
				@dragend="onDragend"
				@dragenter="onDragenter"
				@remove="onRemove"
			)
				template(v-slot:kanban="slotProps")
					slot(name="kanban", :content="slotProps.content", :isTopLevel="slotProps.isTopLevel")
</template>
<script>
	import KanbanLayer from "../molecules/kanbanLayer";

	const isNotAncestor = (target, el) => {
		if (target == el) {
			return false;
		}
		if (target.childNodes) {
			for (let i in target.childNodes) {
				let child = target.childNodes[i];
				if (child instanceof HTMLElement && !isNotAncestor(child, el)) {
					return false;
				}
			}
			return true;
		} else {
			return true;
		}
	};

	const getInsertingIntersiblings = (newParent, x, y) => {
		const len = newParent.children.length;
		for (let i=0; i < len; i++) {
			let child = newParent.children[i];
			let rect = child.getBoundingClientRect();
			if ((rect.top + rect.height / 2) > y) {
				if (i > 0) {
					let before = newParent.children[i-1];
					return [before, child];
				} else {
					return [null, child];
				}
			}
		}
		return [newParent.children[len-1], null];
	};

	export default {
		components : {
			KanbanLayer
		}
        , props: {
			boards : {
				type: Array
				, validator: (value) => { return true; } // TODO
				, required: true
			}
		}
		, computed: {
		}
		, data() {
			return {
				dragging: null
				, draggingOn : null
			}
		}
		, methods : {
            onDragstart(e, parent, kanban) {
				const elem = e.target
					, mirage = elem.cloneNode(true)
					;
				elem.classList.add("dragging");
				mirage.classList.add("dragging");

				this.dragging = {
					elem: elem
					, parent: parent
					, kanban: kanban
					, mirage: mirage
				};
			}
			, onDragend(e, kanban) {
				const elem = e.target;
				elem.classList.remove("dragging");

				// validation
				if (this.dragging && kanban.id !== this.dragging.kanban.id) {
					this.dragging = null;
					this.draggingOn = null;
					return;
				}

				if (this.dragging && this.dragging.mirage.parentNode) {
					// kaban, from ,to
					const from = this.dragging.parent;
					const kanban = this.dragging.kanban;
					const exParent = elem.parentNode;
					const newParent = this.draggingOn.elem;
					const mirage = this.dragging.mirage;

					let index = 0;
					for (let i=0, len=newParent.children.length; i<len; i++) {
						let child = newParent.children[i];
						if (child === mirage) break;
						if (child !== elem) index++;
					}

					this.$emit("arrange", {
						kanban: kanban
						, from: { type: exParent.dataset.type, id: exParent.dataset.id, entity: from }
						, to: { type: this.draggingOn.type, id: this.draggingOn.id, entity: this.draggingOn.entity }
						, index: index 
					});
				}

				if (this.dragging) {
					const mirage = this.dragging.mirage;
					if (mirage && mirage.parentNode ) {
						this.$nextTick(() => {
							mirage.parentNode.removeChild(mirage);
						});
					}
					this.dragging = null;
				}

				if (this.draggingOn) {
					const elem = this.draggingOn.elem;
					this.$nextTick(() => {
						elem.classList.remove("drop-target");
						elem.removeEventListener("dragover", this.onDragover);
					});
					this.draggingOn = null;
				}
			}
			, onDragenter(e, layer) {
				const elem = e.target
					, type = elem.dataset.type
					, id = elem.dataset.id
					, x = e.clientX
					, y = e.clientY
					;

				if (type === undefined) return;
				if (type === "kanban" && this.dragging.elem.dataset.id === id) return;
				if (!isNotAncestor(this.dragging.elem, elem)) return;
				if (!isNotAncestor(this.dragging.mirage, elem)) return;

				if (this.draggingOn) {
					this.draggingOn.elem.classList.remove("drop-target");
					this.draggingOn.elem.removeEventListener("dragover", this.onDragover);
					this.draggingOn = null;
				}

				elem.classList.add("drop-target");
				elem.addEventListener("dragover", this.onDragover);

				this.draggingOn = {
					elem: elem
					, type: type // layer or kanban
					, id: id
					, entity: layer
					, siblings: null
				}

				if (this.dragging) {
					const mirage = this.dragging.mirage;
					const siblings = getInsertingIntersiblings(elem, x, y);
					if (siblings.includes(mirage)) return;
					if (mirage && mirage.parentNode ) {
						mirage.parentNode.removeChild(mirage);
					}
					if (siblings.includes(this.dragging.elem)) return;
					if (siblings[1] === null && elem.children[elem.children.length-1] === this.dragging.elem) return;

					elem.insertBefore(mirage, siblings[1]);
					this.draggingOn.siblings = siblings;
				}
			}
			, onDragover(e) {
				const elem = e.target
					, type = elem.dataset.type
					, id = elem.dataset.id
					, x = e.clientX
					, y = e.clientY
					;

				if (type === undefined) return;
				if (type === "kanban" && this.dragging.elem.dataset.id === id) return;
				if (!isNotAncestor(this.dragging.elem, elem)) return;
				if (!isNotAncestor(this.dragging.mirage, elem)) return;

				if (this.dragging) {
					const mirage = this.dragging.mirage;
					const siblings = getInsertingIntersiblings(elem, x, y);
					if (siblings.includes(mirage)) return;
					if (siblings.includes(this.dragging.elem)) return;
					if (siblings[1] === null && elem.children[elem.children.length-1] === this.dragging.elem) return;
					if (this.draggingOn.siblings !== siblings) {
						if (mirage && mirage.parentNode ) {
							mirage.parentNode.removeChild(mirage);
						}
						elem.insertBefore(mirage, siblings[1]);
						this.draggingOn.siblings = siblings;
					}
				}
			}
			, onRemove(e, parent, kanban) {
				this.$emit("arrange", {
					kanban: kanban
					, from: { type: "layer", id: parent.id, entity: parent }
					, to: { type: "layer", id: "UNCLASSIFIED", entity: this.boards[0].layers[0] }
					, index: 0 
				});
			}
		}
	};

</script>

<style lang="scss">
	@import "../assets/style";
</style>