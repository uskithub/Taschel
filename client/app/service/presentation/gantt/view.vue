<template lang="pug">
	gantt(v-:data="mock", :treenodes="treenodes"
		@addTopLevel="addTopLevelDidPush"
		@arrange="didArrangeTask"
		@edit="editIconDidPush"
		@add="addIconDidPush"
	)
</template>

<script>
	import Vue from "vue";
	import AbstractView from "service/presentation/mixins/abstractView";

	import Treenode from "service/domain/entities/treenode";
	
	import { mapGetters } from "vuex";
	import moment from "moment";
	
	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
		, computed : {
			...mapGetters([
				"projects"
				, "currentProject"
			])
			, treenodes() {
				if (this.currentProject !== null) {
					return this.currentProject.tasks.map(t => {
						return new Treenode(t);
					});
				} else {
					return [];
				}
			}
		}
		, data() {
			return {
				parentEntity: null
				, presuppositionalSiblingEntity: null
				, taskTree: null
				, formSchema : schema.form
				, mock : schema.data
			};
		}
		, methods : {
			// Project Operations
			addTopLevelDidPush(e) {
				this.parentEntity = this.currentProject;
				this.isEditing = true;
			} 
			// UI Operations
			, didArrangeTask({ treenode, from, to, index }) {
				console.log(treenode, from, to, index);

				let _from = { type: "task", code: from.id, entity: from.entity.task };
				let _to = { type: "task", code: to.id, entity: to.entity.task };

				this.arrangeTasksInAnotherTask({ task: treenode.task, from: _from, to: _to, index });
			}
			, editIconDidPush(e, treenode) {
				console.log("editIconDidPush", treenode)
				this.entity = treenode.task;
				this.taskTree = treenode;
				this.isEditing = true;
			}
			, addIconDidPush(e, parent, sibling) {
				// create default values for new task according to its parent task.
				if (sibling) {
					this.presuppositionalSiblingEntity = sibling.task;
					this.parentEntity = parent ? parent.task : this.currentProject;
				} else {
					this.parentEntity = parent.task;
				}
				this.isEditing = true;
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
					this.parentEntity = null;
					this.presuppositionalSiblingEntity = null;
					this.taskTree = null;
				});
			}
		}
		
	};
</script>
<style lang="scss" scoped></style>