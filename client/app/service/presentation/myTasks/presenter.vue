<template lang="pug">
	my-tasks-view(v-if="!isEditing", :schema="tableSchema", :entity="entity" @add="onAdd" @select="onSelect")
	my-tasks-view-editing(v-else, :schema="formSchema", :entity="entity" @endEditing="onEndEditing" @save="onSave" @close="onClose")
</template>
<script>
	import Vue from "vue";
    import AbstractPresenter from "service/presentation/mixins/abstractPresenter";
	import MyTasksView from "./view"
	import MyTasksViewEditing from "./editingView"

    import Task from "service/domain/entities/task";
	
	import schema from "./schema";
    import { mapActions } from "vuex";

    import { 
        自分のタスク一覧を取得する
		, タスクをルートとしたタスクツリーを取得する
		, 新しいタスクを追加する
		, タスクを更新する
		, タスクをクローズする
	} from "service/application/usecases";
    
	const _ = Vue.prototype._;

	schema.table.columns = Task.createTableSchema(schema.table.columns);
	schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "MyTasks"
		, mixins : [ AbstractPresenter ]
		, components : {
			MyTasksView
			, MyTasksViewEditing
		}
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
				, タスクをルートとしたタスクツリーを取得する
				, 新しいタスクを追加する
				, タスクを更新する
				, タスクをクローズする
			})
			, onAdd() {
				this.isEditing = true;
			}
			, onSelect(entity) {
				this.entity = entity;
				this.タスクをルートとしたタスクツリーを取得する(entity)
				.then(_ => { this.isEditing = true; });
			}
			, onEndEditing() {
				this.isEditing = false;
				// this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
				});
			}
			, onSave(data, isNewEntity) {
				return Promise.resolve().then(() => {
					if ( isNewEntity ) {
						return this.新しいタスクを追加する(data);
					} else {
						return this.タスクを更新する(data);
					}
				}).then(() => {
					this.onEndEditing();
				});
			}
			, onClose(data) {
				return Promise.resolve().then(() => {
					return this.タスクをクローズする(data);
				}).then(() => {
					this.onEndEditing();
				});
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