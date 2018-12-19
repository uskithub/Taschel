<template lang="pug">
	section
		editing(v-if="isEditing", :entity="entity", :parent="parentEntity", :taskTree="taskTree" , :schema="formSchema" @close="didReceiveCloseEvent")
		gantt(v-else, :data="mock", :treenodes="treenodes"
			@addTopLevel="addTopLevelDidPush"
			@arrange="didArrangeTask"
			@edit="editIconDidPush"
			@add="addIconDidPush"
		)
</template>

<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import Task from "../../../fundamentals/entities/task";
	import Treenode from "../treenode";
	import Editing from "./editing";
	import { mapGetters, mapActions } from "vuex";
	import schema from "./schema";
	import moment from "moment";
	
	import $ from "jquery";
	import "jquery-ui/ui/widgets/draggable";
	import "jquery-ui/ui/widgets/resizable"; // なくても動くがrequirementなので

	const _ = Vue.prototype._;

	schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "GanttChart"
		, mixins : [ Base ]
		, components : {
			Editing
		}
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
				isEditing: false
				, entity: null
				, parentEntity: null
				, taskTree: null
				, formSchema : schema.form
				, mock : schema.data
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getUserProjectList"
				, "arrangeTasksInAnotherTask"
				, "selectProject"
			])
			// Project Operations
			, addTopLevelDidPush(e) {
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
			, addIconDidPush(e, treenode) {
				// create default values for new task according to its parent task.
				this.parentEntity = treenode.task;
				this.isEditing = true;
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
					this.parentEntity = null;
					this.taskTree = null;
				});
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("GanttChart") });
		}
		, sessionEnsured(me) {
			return this.getUserProjectList()
				.then(() => {
					this.setSelectorOnLastCrumb({
						items: this.projects
						, itemDidPush: (item) => {
							this.selectProject(item);
							this.popCrumb();
							this.pushCrumb({ id: item.code, name: item.name });
						}
					});
					this.pushCrumb({ 
						id: this.currentProject.code
						, name: this.currentProject.name
					});
				});
		}
	};
</script>

<style lang="scss" scoped>
</style>