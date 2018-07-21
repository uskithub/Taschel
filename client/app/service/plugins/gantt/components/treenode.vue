<template lang="pug">
	li.treenode(:draggable="draggable", :key="treenode.id", :data-id="treenode.id"
		@mouseover.prevent.stop="onmouseover"
		@mouseout.prevent.stop="onmouseout"
		@click="$emit('click', $event, treenode)"
		@dragstart="$emit('dragstart', $event, parent, treenode)"
		@dragend="$emit('dragend', $event, treenode)"
	)
		slot(:name="treenode.name")
			.media-content
				span.icon(v-if="treenode.subtree.length > 0" @click.prevent.stop="$emit('toggle-caret', $event, treenode.id)")
					i.fa(:class="{ 'fa-caret-down': isOpeningMap[treenode.id], 'fa-caret-right': !isOpeningMap[treenode.id] }")
				span.treelist-node-header  {{ treenode.name }}
				span.operation(v-show="isHovering")
					span.icon(@click.prevent.stop="$emit('addIconDidPush', $event, treenode)")
						i.fa.fa-plus
				ul.treelist(v-show="isOpeningMap[treenode.id]" data-type="treenode", :data-id="treenode.id"
					@dragenter="ondragenter($event, treenode)"
				)
					treenode(v-for="childnode in treenode.subtree", :parent="treenode", :treenode="childnode", :isOpeningMap="isOpeningMap", :key="childnode.id"
						@addIconDidPush="addIconDidPush"
						@dragstart="ondragstart"
						@dragend="ondragend"
						@dragenter="ondragenter"
						@toggle-caret="caratDidClick"
					)
</template>

<script>
	import { cloneDeep, isObject } from "lodash";
	
	// Summary:
	//  - kanban corresponds to a task.
	//	- kanbans may contain an other kanban-list.
	
	// Interface:
	//  - kanban emits click events with the task.

	export default {
		name: "Treenode"
        , props: {
			parent: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, treenode: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, isOpeningMap: {
				type: Object
			}
			, draggable: {
				type: Boolean
				, default: true
			}
		}
		, data() {
			return {
				isHovering: false
			}
		}
        , methods: {
            onmouseover(e) {
				this.isHovering = true;
			}
			, onmouseout(e) {
				this.isHovering = false;
			}
			, addIconDidPush(e, treenode) {
				this.$emit("addIconDidPush", e, treenode);
				e.stopPropagation();
			}
            , ondragstart(e, parent, treenode) {
				this.$emit("dragstart", e, parent, treenode);
				e.stopPropagation();
			}
			, ondragend(e, treenode) {
				this.$emit("dragend", e, treenode);
				e.stopPropagation();
			}
			, ondragenter(e, treenode) {
				this.$emit("dragenter", e, treenode);
				e.stopPropagation();
			}
			, caratDidClick(e, id) {
				this.$emit("toggle-caret", e, id);
				e.stopPropagation();
			}
        }
	};
</script>

<style lang="scss">
	@import "../assets/style";
</style>
<style scoped>
	.vue-gantt-legend {
		flex-shrink: 0;
		width: 225px;
		overflow: hidden;
		box-sizing: border-box;
		border: 1px solid #DDD;
		border-bottom: none;
		position: relative;
		z-index: 20;
	}

	.vue-gantt-legend .title {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 72px;
		box-sizing: border-box;
		border-bottom: 1px solid #DDD;
	}

	.vue-gantt-legend .task {
		line-height: 24px;
		box-sizing: border-box;
		border-bottom: 1px solid #DDD;
		cursor: pointer;
		height: 24px;
		margin: 0;
		width: 100%;
	}

	.vue-gantt-legend .task .task-name {
		font-weight: bold;
		padding: 0 10px;
	}
</style>