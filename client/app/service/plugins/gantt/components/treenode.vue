<template lang="pug">
	li.treenode(:draggable="draggable", :key="treenode.id", :data-id="treenode.id"
		@click="$emit('click', $event, treenode)"
		@dragstart="$emit('dragstart', $event, treenode)"
		@dragend="$emit('dragend', $event, treenode)"
	)
		slot(:name="treenode.name")
			.media-content
				span.icon(v-if="treenode.subtree.length > 0" @click.prevent.stop="caratDidClick")
					i.fa(:class="{ 'fa-caret-down' : isOpening, 'fa-caret-right': !isOpening }")
				span.treelist-node-header  {{ treenode.name }}
				ul.treelist(v-show="isOpening" data-type="treenode", :data-id="treenode.id")
					treenode(v-for="childnode in treenode.subtree", :treenode="childnode", :key="childnode.id"
						@dragstart="ondragstart"
						@dragend="ondragend"
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
			treenode: {
				type: Object
				, validator: (value) => {
					if (value.name === undefined || value.id === undefined) return false;
					return true; 
				}
			}
			, draggable: {
				type: Boolean
				, default: true
			}
		}
		, data() {
			return {
				isOpening: true
			};
		}
        , methods: {
            ondragstart(e, treenode) {
				this.$emit("dragstart", e, treenode);
				e.stopPropagation();
			}
			, ondragend(e, treenode) {
				this.$emit("dragend", e, treenode);
				e.stopPropagation();
			}
			, caratDidClick(e) {
				this.isOpening = !this.isOpening;
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