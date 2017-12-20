<template lang="pug">
	gant-page(:schema="schema", :currentProject="currentProject", :projects="projects", :me="me")
</template>

<script>
	import Vue from "vue";
	import GantPage from "../../core/DefaultGantPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD_PROJECTS, LOAD_USERS, SELECT, UPDATE } from "../common/constants/mutationTypes";

	export default {
		
		components : {
			GantPage: GantPage
		}
		, computed : {
			...mapGetters("shared", [
				"projects"
				, "users"
				, "currentProject"
			])
			// TODO: GantだけProject読み込み時にPopulateさせているのでSharedと分けるかもしれないので残している
			// , ...mapGetters("gantPage", [
			// 	"projects"
			// ])
			, ...mapGetters("session", [
				"me"
			])
		}

		/**
		 * Set page schema as data property
		 */
		, data() {
			return {
				// gant-pageに当てはめる値を定義したオブジェクト
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
				arranged(res) {
					console.log("● arranged", res);
					// this.created(res.data);
					toast.success(this._("TaskNameAdded", res), this._("再配置しました"));
				},

				/**
				 * Task updated
				 * @param  {Object} res Task object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("TaskNameUpdated", res), this._("更新しました"));
				},

				/**
				 * Task removed
				 * @param  {Object} res Response object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("TaskNameDeleted", res), this._("削除しました"));
				}
			}
		}		
		, methods : {
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT
			})
			, ...mapMutations("gantPage", {
				select : SELECT
			})
			, ...mapActions("gantPage", {
				createModel : "createTask"
				, getProjects : "readTasks"
				, updateModel : "updateTask"
				, arrange : "arrangeTask"
				, getUsers : "readUsers"
			})
			, ...mapActions("session", [
				"getSessionUser"
			])
			, selectProject(code) {
				this.setCurrentProject(code);
			}
			, deselectProject() {
				this.setCurrentProject(code);
			}
			, setupProjectsField() {
				console.log("●", this.currentProject);
				// 動的にプロジェクト一覧を設定している
				this.schema.form.fields.forEach(f => {
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
			, setupAsigneeField() {
				// 動的にプロジェクト一覧を設定している
				this.schema.form.fields.forEach(f => {
					if (f.model == "asignee_code") {
						f.values = this.users.map(user => {
							return {
								id : user.code
								, name : user.username
							}
						});
						// f.default = this.me.code;
					}
				});
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			// projectの選択が変わったら、初期値を変える
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${LOAD_PROJECTS}`
					|| mutation.type == `shared/${SET_CURRENT_PROJECT}`
				) {
					this.setupProjectsField();
				}
				if (mutation.type == `shared/${LOAD_USERS}`) {
					this.setupAsigneeField();
				}
				if (mutation.type == `shared/${UPDATE}`) {
					this.setCurrentProject(this.currentProject);
					// console.log("forceUpdate", this);
					// this.$forceUpdate();
				}
			});

			this.getProjects({
				options: { taskType : "project", populateParent : true }
				, mutation: `shared/${LOAD_PROJECTS}`
			});

			if (this.users.length > 0) {
				this.setupAsigneeField();
			} else {
				this.getUsers({ mutation: `shared/${LOAD_USERS}` });	
			}
		}
	};
</script>