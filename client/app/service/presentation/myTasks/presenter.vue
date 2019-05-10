<!-- // DDD: Presentation -->
<template lang="pug">
	my-tasks-view(:tableSchema="tableSchema", :formSchema="formSchema")
</template>

<script>
	import Vue from "vue";
    import AbstractPresenter from "service/presentation/mixins/abstractPresenter";
    import MyTasksView from "./view"

    import Task from "service/domain/entities/task";

	// import Treenode from "../../plugins/gantt/treenode";
	
	import schema from "./schema";
    import { mapActions } from "vuex";

    import { 
        自分のタスク一覧を取得する
        , タスク詳細を取得する
	} from "service/application/usecases";
    
	const _ = Vue.prototype._;

	schema.table.columns = Task.createTableSchema(schema.table.columns);
	schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "MyTasks"
		, mixins : [ AbstractPresenter ]
		, components : {
            MyTasksView
		}
		, computed : { }
		, data() {
			return {
				isEditing: false
				, entity: null
				, tableSchema : schema.table
				, formSchema : schema.form
			};
		}
		, methods : {
            ...mapActions({
                自分のタスク一覧を取得する
                , タスク詳細を取得する
            })
			, didSelectRow(data) {
				this.entity = data;
				this.タスク詳細を取得する(entity)
					.then(() => {
						console.log("ほげ");
						// if (this.currentEditingTaskTree !== null) {
						// 	this.taskTree = new Treenode(this.currentEditingTaskTree);
						// } else {
						// 	// TODO: エラー
						// }
						// this.isEditing = true;
					});
			}
			, didReceiveCloseEvent() {
				// this.isEditing = false;
				// this.popCrumb();
				// this.$nextTick(() => {
				// 	this.entity = null;
				// 	this.taskTree = null;
				// });
			}
		}
		, created() {
			// this.pushCrumb({ id: this._uid, name: _("MyTask") });
		}
		, sessionEnsured(me) {
			this.自分のタスク一覧を取得する();
		}
	};
</script>