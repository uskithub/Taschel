<template lang="pug">
	list-page(v-if="me", :schema="schema", :selected="selected", :rows="tasks", :me="me"
		, :save-model="saveModel"
		, :update-model="updateModel"
		, :delete-model="deleteModel"
		, :clear-selection="clearSelection"
	)
</template>

<script>
	import Vue from "vue";
	import ListPage from "../../core/DefaultListPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_PROJECTS, SET_CURRENT_PROJECT, LOAD, SELECT, CLEAR_SELECT, ADD , UPDATE, REMOVE, SET_USER } from "../common/constants/mutationTypes";

	export default {
		
		components : {
			ListPage: ListPage
		}
		, computed : {
			...mapGetters("shared", [
				"projects"
				, "currentProject"
			])
			, ...mapGetters("mytasksPage", [
				"tasks",
				"selected"
			])
			, ...mapGetters("session", [
				"me"
			])
		}

		/**
		 * Set page schema as data property
		 * インスタンスプロパティのような扱い。複数同じコンポーネントが一つの画面上で利用されていたとしも、
		 * 表示に関わる値を個別に持てるように、return objとしている。
		 */
		, data() {
			return {
				schema
			};
		}
		/**
		 * Socket handlers. Every property is an event handler
		 */
		, socket : {
			prefix : "/tasks/"
			, events : {
				/**
				 * New task added
				 * @param  {Object} res Task object
				 */
				created(res) {
					// server側の this.notifyModelChanges(ctx, "created", json); で呼ばれる
					console.log("● created on index.vue", res.data);
					this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("追加しました"));
				}

				, brokedown(res) {
					console.log("● brokedown on index.vue", res.data);
					this.updated(res.data.parent);
					this.created(res.data.child);
					// TODO: 連続でブレークダウンできるようにする
					// this.selectRow(res.data.child, false);
					toast.success(this._("TaskNameAdded", res), this._("ブレークダウンしました"));
				}

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				, updated(res) {
					this.updated(res.data);
					toast.success(this._("TaskNameUpdated", res), this._("更新しました"));
				}

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				, removed(res) {
					this.removed(res.data);	
					toast.success(this._("TaskNameDeleted", res), this._("削除しました"));
				}
			}
		}		
		, methods : {
			...mapMutations("mytasksPage", {
				selectRow : SELECT
				, updated : UPDATE
				, clearSelection : CLEAR_SELECT
				, created : ADD
				, removed : REMOVE
			})
			, ...mapActions("mytasksPage", {
				getTasks : "readTasks"
				, updateTask : "updateTask"
				, createTask : "createTask"
				, deleteTask : "deleteTask"
			})
			, ...mapActions("session", [
				"getSessionUser"
			])
			, setupProjectsField() {
				// 動的にプロジェクト一覧を設定している
				this.schema.popupForm.form.fields.forEach(f => {
					if (f.model == "root_code") {
						f.values = this.projects.map(project => {
							return {
								id : project.code
								, name : project.name
							}
						});
						f.default = this.currentProject;
					}
				});
			}
			, saveModel(model) {
				this.createTask( { model, mutation: ADD } );
			}
			, updateModel(model) {
				this.updateTask( { model, mutation: UPDATE } );
			}
			, deleteModel(model) {
				this.deleteTask( { model, mutation: REMOVE } );
			}
		}

		/**
		 * Call if the component is created
		 * インスタンスが作成された後に同期的に呼ばれる
		 * データの監視とイベントの初期セットアップが完了した状態
		 */
		, created() {
			// projectの選択が変わったら、初期値を変える
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${LOAD_PROJECTS}`
					|| mutation.type == `shared/${SET_CURRENT_PROJECT}`
				) {
					this.setupProjectsField();
				}
			});	

			if (this.projects.length > 0) {
				this.setupProjectsField();

			} else {
				this.getTasks({ 
					options: { taskType : "project" }
					, mutation: `shared/${LOAD_PROJECTS}`
				});
			}

			if (this.me) {
				this.getTasks({ 
					options: { user : this.me.code }
					, mutation: `mytasksPage/${LOAD}`
				});
			} else {
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				this.$store.subscribe((mutation, state) => {
					if (mutation.type == `session/${SET_USER}`) {
						this.getTasks({ 
							options: { user : this.me.code }
							, mutation: `mytasksPage/${LOAD}`
						});
					}
				});				
			}
		}
	};
</script>