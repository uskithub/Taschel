<template lang="pug">
	gant-page(:schema="schema", :selectedProject="currentProject", :projects="projects")
</template>

<script>
	import Vue from "vue";
	import GantPage from "../../core/DefaultGantPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, LOAD_PROJECTS } from "../common/constants/mutationTypes";

	export default {
		
		components : {
			GantPage: GantPage
		}
		, computed : {
			...mapGetters("shared", [
				"projects"
				, "currentProject"
			])
			// TODO: GantだけProject読み込み時にPopulateさせているのでSharedと分けるかもしれないので残している
			// , ...mapGetters("gantPage", [
			// 	"projects"
			// ])
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
			, ...mapActions("gantPage", {
				getProjects : "readTasks"
				, arrange : "arrangeTask"
			})
			, selectProject(code) {
				this.setCurrentProject(code);
			}
			, deselectProject() {
				this.setCurrentProject(code);
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			// Download rows for the page
			this.getProjects({
				options: { taskType : "project", populateParent : true }
				, mutation: `shared/${LOAD_PROJECTS}`
			});
		}
	};
</script>