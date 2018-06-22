<template lang="pug">
	ul.treelist-board-container
		li.treelist-board(v-for="(treelist, idx) in treelists", :key="treelist.id")
			span.icon(v-if="treelist.subtree.length > 0" @click.prevent.stop="caratDidClick($event, idx)")
				i.fa(:class="{ 'fa-caret-down' : isOpeningArr[idx], 'fa-caret-right': !isOpeningArr[idx] }")
			span.treelist-board-header {{ treelist.name }}
			.drag-options
			ul.treelist(v-show="isOpeningArr[idx]" data-type="treelist", :data-id="treelist.id"
				@dragenter="ondragenter($event, treelist)"
			)
				treenode(v-for="treenode in treelist.subtree", :treenode="treenode", :key="treenode.id"
					@dragstart="ondragstart"
					@dragend="ondragend"
				)
</template>
<script>

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
		name: "Treelist"
        , props: {
			treelists : {
				type: Array
				, validator: (value) => { return true; } // TODO
			}
			, legendHelp: {
      			type: String
				, default: "hoge"
    		}
		}
		, computed: {
		}
		, data() {
			return {
				isOpeningArr: this.treelists.map(t => true)
				, dragging: null
				, draggingOn : null
			}
		}
		, methods : {
            ondragstart(e, treenode) {
				const elem = e.target
					, mirage = elem.cloneNode(true)
					;
				elem.classList.add("dragging");
				mirage.classList.add("dragging");

				this.dragging = {
					elem: elem
					, treenode: treenode
					, mirage: mirage
				};
			}
			, ondragend(e, treenode) {
				const elem = e.target;
				elem.classList.remove("dragging");

				if (this.dragging && this.dragging.mirage.parentNode) {
					// kaban, from ,to
					const treenode = this.dragging.treenode;
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
						treenode: treenode
						, from: { type: exParent.dataset.type, id: exParent.dataset.id }
						, to: { type: this.draggingOn.type, id: this.draggingOn.id }
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
						elem.removeEventListener("dragover", this.ondragover);
					});
					this.draggingOn = null;
				}
			}
			, ondragenter(e, board) {
				const elem = e.target
					, type = elem.dataset.type
					, id = elem.dataset.id
					, x = e.clientX
					, y = e.clientY
					;

				if (type === undefined) return;
				if (type === "treenode" && this.dragging.elem.dataset.id === id) return;
				if (!isNotAncestor(this.dragging.elem, elem)) return;
				if (!isNotAncestor(this.dragging.mirage, elem)) return;

				if (this.draggingOn) {
					this.draggingOn.elem.classList.remove("drop-target");
					this.draggingOn.elem.removeEventListener("dragover", this.ondragover);
					this.draggingOn = null;
				}

				elem.classList.add("drop-target");
				elem.addEventListener("dragover", this.ondragover);

				this.draggingOn = {
					elem: elem
					, type: type // board or kanban
					, id: id
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
			, ondragover(e) {
				const elem = e.target
					, type = elem.dataset.type
					, id = elem.dataset.id
					, x = e.clientX
					, y = e.clientY
					;

				if (type === undefined) return;
				if (type === "treenode" && this.dragging.elem.dataset.id === id) return;
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
			, caratDidClick(e, idx) {
				this.isOpeningArr.splice(idx, 1, !this.isOpeningArr[idx]);
			}
		}
	};

</script>

<style lang="scss">
	@import "../assets/style";
</style>
<style lang="scss" scoped>

	.vue-gantt-legend {
		flex-shrink: 0;
		width: 225px;
		overflow: hidden;
		box-sizing: border-box;
		border: 1px solid #DDD;
		border-bottom: none;
		position: relative;
		z-index: 20;

		.title {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 72px;
			box-sizing: border-box;
			border-bottom: 1px solid #DDD;
		}

		.task {
			box-sizing: border-box;
			width: 100%;

			.task-name {
				font-weight: bold;
				padding: 0 10px;
			}
		}
	}
</style>