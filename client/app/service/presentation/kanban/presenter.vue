<template lang="pug">
	//- hogehoge-view(:schema="schema", :entity="entity" @add="onAdd" @select="onSelect")
	hogehoge-view
</template>
<script>
	import Vue from "vue";
    import AbstractPresenter from "system/mixins/abstractPresenter";
	import HogehogeView from "./view"

    import Task from "service/domain/entities/task";
	
	// import schema from "./schema";
    import { mapGetters, mapActions } from "vuex";

    import { 
        自分のプロジェクト一覧を取得する
        , プロジェクトを選択する
        , プロジェクトのカンバンを取得する
	} from "service/application/usecases";
    
	const _ = Vue.prototype._;

	export default {
		name : "Hogehoge"
		, mixins : [ AbstractPresenter ]
		, components : {
			HogehogeView
        }
        , computed : {
			...mapGetters([
				"currentProject"
			])
		}
		, data() {
			return {
			};
		}
		, methods : {
            ...mapActions({
                自分のプロジェクト一覧を取得する
                , プロジェクトを選択する
                , プロジェクトのカンバンを取得する
			})
			// イベントハンドラはここに記述
			// , onAdd() { ... }
			// , onSelect() { ... }
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: _("Kanban") });
		}
		, sessionEnsured(me) {
            // セッションが準備できた時に呼ばれる（AbstractPresenterで定義）
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
                    this.プロジェクトのカンバンを取得する();
				});
		}
	};
</script>