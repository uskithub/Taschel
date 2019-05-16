<template lang="pug">
	ul.treelist-board-container
		li.treelist-board(v-for="treenode in treenodes", :key="treenode.id", :class="getClass(treenode)" 
			@mouseover="onMouseover($event, treenode.id)" 
			@mouseout="onMouseout($event, treenode.id)"
		)
			.tree-item
				input.checkbox(type="checkbox")
				span.icon(v-if="treenode.subtrees.length > 0" @click.prevent.stop="caratDidClick($event, treenode.id)")
					i.fa(:class="{ 'fa-caret-down': !(foldingConditionMap[treenode.id]===false), 'fa-caret-right': foldingConditionMap[treenode.id]===false }")
				span.treelist-board-header(:class="treenode.styleClass") {{ treenode.name }}
				span.operation(v-show="isHoveringMap[treenode.id]")
					span.icon(@click.prevent.stop="$emit('editIconDidPush', $event, treenode)")
						i.fa.fa-edit
					span.icon(@click.prevent.stop="$emit('addIconDidPush', $event, treenode)")
						i.fa.fa-plus
					span.icon(@click.prevent.stop="$emit('addIconDidPush', $event, null, treenode)")
						i.fa.fa-arrow-right
			ul.treelist(v-if="!(foldingConditionMap[treenode.id]===false)" data-type="treelist", :data-id="treenode.id"
				@dragenter="onDragenter($event, treenode)"
			)
				treenode(v-for="childnode in treenode.subtrees", :parent="treenode", :treenode="childnode", :foldingConditionMap="foldingConditionMap", :key="childnode.id"
					@editIconDidPush="editIconDidPush"
					@addIconDidPush="addIconDidPush"
					@dragstart="onDragstart"
					@dragend="onDragend"
					@dragenter="onDragenter"
					@toggle-caret="caratDidClick"
				)
			ul.treelist(v-else data-type="treelist", :data-id="treenode.id"
				@dragenter="onDragenter($event, treenode)"
			)
</template>
<script>

	import Vue from "vue";

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
			treenodes : {
				type: Array
				, validator: (value) => { return true; } // TODO
			}
			, foldingConditionMap: {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, legendHelp: {
      			type: String
				, default: "hoge"
    		}
		}
		, data() {
			return {
				isHoveringMap: {}
				, dragging: null
				, draggingOn : null
			}
		}
		, methods : {
			// for presentation
			getClass(treenode) {
				return treenode.task.type;
			}

			// for interactione
			, onMouseover(e, id) {
				Vue.set(this.isHoveringMap, id, true);
			}
			, onMouseout(e, id) {
				Vue.set(this.isHoveringMap, id, false);
			}
			, editIconDidPush(e, treenode) {
				this.$emit("editIconDidPush", e, treenode);
				e.stopPropagation();
			}
			, addIconDidPush(e, parent, sibling) {
				this.$emit("addIconDidPush", e, parent, sibling);
				e.stopPropagation();
			}
            , onDragstart(e, parent, treenode) {
				const elem = e.target
					, mirage = elem.cloneNode(true)
					;
				elem.classList.add("dragging");
				mirage.classList.add("dragging");

				this.dragging = {
					elem: elem
					, parent: parent
					, treenode: treenode
					, mirage: mirage
				};

				console.log("ondragstart", treenode);
			}
			, onDragend(e, treenode) {
				const elem = e.target;
				elem.classList.remove("dragging");

				// validation
				if (this.dragging && treenode.id !== this.dragging.treenode.id) {
					this.dragging = null;
					this.draggingOn = null;
					return;
				}

				if (this.dragging && this.dragging.mirage.parentNode) {
					// treenode, from ,to
					const from = this.dragging.parent;
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
						elem.removeEventListener("dragover", this.ondragover);
					});
					this.draggingOn = null;
				}
			}
			, onDragenter(e, treenode) {
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
					, type: type
					, id: id
					, entity: treenode
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
			, caratDidClick(e, id) {
				this.$emit("toggleFolding", e, id);
			}
		}
	};

</script>

<style lang="scss">
	@import "../assets/style";
</style>
<style lang="scss" scoped>
</style>