<template lang="pug">
	projects-view(v-if="!isEditing", :schema="tableSchema", :entity="entity" @add="onAdd" @select="onSelect")
	projects-view-editing(v-else, :schema="formSchema", :entity="entity" @endEditing="onEndEditing" @save="onSave" @close="onClose")
</template> 
<script>
	import Vue from "vue";
    import AbstractPresenter from "system/mixins/abstractPresenter";
    import ProjectsView from "./view"
    import ProjectsViewEditing from "./editingView"
    
	import Project from "service/domain/entities/project";
    
	import schema from "./schema";
    import { mapActions } from "vuex";
    
    import { 
        自分のプロジェクト一覧を取得する
        , 新しいプロジェクトを追加する
        , プロジェクトを更新する
        , プロジェクトをクローズする
	} from "service/application/usecases";

	const _ = Vue.prototype._;

	schema.table.columns = Project.createTableSchema(schema.table.columns);
	schema.form.fields = Project.createFormSchema(schema.form.fields);
	
	export default {
		// using name for breadcrumb at create()
		name : "Projects"
		, mixins : [ AbstractPresenter ]
		, components : {
            ProjectsView
            , ProjectsViewEditing
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
			...mapActions([
                自分のプロジェクト一覧を取得する
                , 新しいプロジェクトを追加する
                , プロジェクトを更新する
                , プロジェクトをクローズする
			])
			, onAdd() {
				this.isEditing = true;
            }
            , onSelect(entity) {
				this.entity = entity;
				this.isEditing = true;
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
						return this.新しいプロジェクトを追加する(data);
					} else {
						return this.プロジェクトを更新する(data);
					}
				}).then(() => {
					this.onEndEditing();
				});
			}
			, onClose(data) {
				return Promise.resolve().then(() => {
					return this.プロジェクトをクローズする(data);
				}).then(() => {
					this.onEndEditing();
				});
			}
		}
		, created() {
			// this.pushCrumb({ id: this._uid, name: _("Project") });
		}
		, sessionEnsured(me) {
			this.自分のプロジェクト一覧を取得する();
		}
	};
</script>