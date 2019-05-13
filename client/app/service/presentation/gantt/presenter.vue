<template lang="pug">
	section
		gantt-editing-view(v-if="isEditing", :entity="entity", :parent="parentEntity", :sibling="presuppositionalSiblingEntity", :taskTree="taskTree" , :schema="formSchema" @close="didReceiveCloseEvent")
		gantt(v-else, :data="mock", :treenodes="treenodes"
			@addTopLevel="addTopLevelDidPush"
			@arrange="didArrangeTask"
			@edit="editIconDidPush"
			@add="addIconDidPush"
		)
</template>

<script>
	import Vue from "vue";
	import AbstractPresenter from "service/presentation/mixins/abstractPresenter";

	import Task from "service/domain/entities/task";
	import Treenode from "service/domain/entities/treenode";
	
	import GanttView from "./view"
	import GanttEditingView from "./editingView"

	import { mapGetters, mapActions } from "vuex";

    import { 
        自分のプロジェクト一覧を取得する
		, プロジェクトを選択する
	} from "service/application/usecases";

	import schema from "./schema";
	import moment from "moment";
	
	const _ = Vue.prototype._;

	schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "GanttChart"
		, mixins : [ AbstractPresenter ]
		, components : {
			GanttView
			, GanttEditingView
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
				, presuppositionalSiblingEntity: null
				, taskTree: null
				, formSchema : schema.form
				, mock : schema.data
			};
		}
		, methods : {
			...mapActions([
				自分のプロジェクト一覧を取得する
				, プロジェクトを選択する
				// Usecases
				, "arrangeTasksInAnotherTask"
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
		, created() {
			// this.pushCrumb({ id: this._uid, name: _("GanttChart") });
		}
		, sessionEnsured(me) {
			return this.自分のプロジェクト一覧を取得する()
				.then(() => {
					// this.setSelectorOnLastCrumb({
					// 	items: this.projects
					// 	, itemDidPush: (item) => {
					// 		this.プロジェクトを選択する(item);
					// 		this.popCrumb();
					// 		this.pushCrumb({ id: item.code, name: item.name });
					// 	}
					// });
					// this.pushCrumb({ 
					// 	id: this.currentProject.code
					// 	, name: this.currentProject.name
					// });
				});
		}
	};
</script>