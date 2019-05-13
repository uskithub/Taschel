<template lang="pug">
	section
		gantt-editing-view(v-if="isEditing", :entity="entity", :parent="parentEntity", :sibling="presuppositionalSiblingEntity", :taskTree="taskTree" , :schema="formSchema"
			@endEditing="onEndEditing"
			@save="onSave"
		)
		gantt-view(v-else, :data="mock"
			@addTopLevel="onAddTopLevel"
			@arrange="onArrange"
			@edit="onEdit"
			@add="onAdd"
		)
</template>

<script>
	import Vue from "vue";
	import AbstractPresenter from "system/mixins/abstractPresenter";

	import Task from "service/domain/entities/task";
	import Treenode from "service/domain/entities/treenode";
	
	import GanttView from "./view"
	import GanttEditingView from "./editingView"

	import { mapGetters, mapActions } from "vuex";

    import { 
        自分のプロジェクト一覧を取得する
		, プロジェクトを選択する
		, プロジェクトにタスクを追加する
		, プロジェクトのタスクを編集する
		, タスクを別のタスクの子タスクにする
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
				, プロジェクトにタスクを追加する
				, プロジェクトのタスクを編集する
				, タスクを別のタスクの子タスクにする
			])
			// Project Operations
			, onAddTopLevel(e) {
				this.parentEntity = this.currentProject;
				this.isEditing = true;
			} 
			// UI Operations
			, onArrange(treenode, from, to, index) {
				console.log(treenode, from, to, index);

				let _from = { type: "task", code: from.id, entity: from.entity.task };
				let _to = { type: "task", code: to.id, entity: to.entity.task };

				this.タスクを別のタスクの子タスクにする({ task: treenode.task, from: _from, to: _to, index });
			}
			, onEdit(treenode) {
				console.log("editIconDidPush", treenode)
				this.entity = treenode.task;
				this.taskTree = treenode;
				this.isEditing = true;
			}
			, onAdd(parent, sibling) {
				// create default values for new task according to its parent task.
				if (sibling) {
					this.presuppositionalSiblingEntity = sibling.task;
					this.parentEntity = parent ? parent.task : this.currentProject;
				} else {
					this.parentEntity = parent.task;
				}
				this.isEditing = true;
			}
			, onEndEditing() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
					this.parentEntity = null;
					this.presuppositionalSiblingEntity = null;
					this.taskTree = null;
				});
			}
			, onSave(data, isNewEntity) {
				return Promise.resolve().then(() => {
					if ( isNewEntity ) {
						return this.プロジェクトにタスクを追加する(data);
					} else {
						return this.プロジェクトのタスクを編集する(data);
					}
				}).then(() => {
					this.onEndEditing();
				});
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("GanttChart") });
		}
		, sessionEnsured(me) {
			return this.自分のプロジェクト一覧を取得する()
				.then(() => {
					this.setSelectorOnLastCrumb({
						items: this.projects
						, itemDidPush: (item) => {
							this.プロジェクトを選択する(item);
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