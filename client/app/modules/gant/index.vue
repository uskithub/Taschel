<template lang="pug">
	gant-page(:schema="schema", :projects="projects")
</template>

<script>
	import Vue from "vue";
	import GantPage from "../../core/DefaultGantPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_PROJECTS } from "../../common/mutationTypes";

	export default {
		
		components : {
			GantPage: GantPage
		}
		, computed : {
			...mapGetters("gantPage", [
				"projects"
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
			...mapActions("gantPage", {
				getTasks : "readTasks"
				, arrange : "arrangeTask"
			})
			, selectProject(code) {
				this.getTasks({
					options: { root : code }
					, mutation: LOAD
				});
			}
			, deselectProject() {
				this.loadTasks([]);
			}
		}

		/**
		 * Call if the component is created
		 */
		, created() {
			// Download rows for the page
			this.getTasks({
				options: { taskType : "project", populateParent : true }
				, mutation: LOAD_PROJECTS
			});
		}
	};
</script>