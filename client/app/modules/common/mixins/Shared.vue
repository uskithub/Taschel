<script>
	import Vue from "vue";

	import { cloneDeep } from "lodash";
	import moment from "moment";

	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { SET_CURRENT_PROJECT, SET_CURRENT_WEEK, SET_CURRENT_USER, LOAD_USERS, LOAD_PROJECTS } from "../constants/mutationTypes";

	export default {
		
		computed : {
			...mapGetters("shared", [
				"projects"
				, "users"
				, "currentProject"
				, "currentWeek"
				, "currentUser"
			])
			, ...mapGetters("session", [
				"me"
			])
		}
		, methods : {
			...mapMutations("shared", {
				setCurrentProject : SET_CURRENT_PROJECT
				, setCurrentWeek : SET_CURRENT_WEEK
				, setCurrentUser : SET_CURRENT_USER
			})
			, ...mapActions("shared", {
				getUsers : "readUsers"
				, getProjects : "readTasks"
			})
			// , ...mapActions("session", [
			// 	"getSessionUser"
			// ])
			// setup projectSelector dynamically.
			, setupProjectsField() {
				if (this.schema == undefined || this.schema.popupForm == undefined) {
					return;
				}

				if (this.schema.popupForm.form.fields == undefined && this.schema.popupForm.form.groups) {
					this.schema.popupForm.form.groups.forEach(g => {
						g.fields.forEach(f => {
							if (f.model == "root_code") {
								f.values = this.projects.map(project => {
									return { id : project.code, name : project.name };
								});
								f.default = this.currentProject;
							}
						});
					})
				} else {
					this.schema.popupForm.form.fields.forEach(f => {
						if (f.model == "root_code") {
							f.values = this.projects.map(project => {
								return { id : project.code, name : project.name };
							});
							f.default = this.currentProject;
						}
					});
				}
			}
			, setupAsigneeField() {
				if (this.schema == undefined || this.schema.popupForm == undefined) {
					return;
				}

				if (this.schema.popupForm.form.fields == undefined && this.schema.popupForm.form.groups) {
					this.schema.popupForm.form.groups.forEach(g => {
						g.fields.forEach(f => {
							if (f.model == "asignee_code") {
								f.values = this.users.map(user => {
									return { id : user.code, name : user.username };
								});
							}
						});
					})
				} else {
					this.schema.popupForm.form.fields.forEach(f => {
						if (f.model == "asignee_code") {
							f.values = this.users.map(user => {
								return { id : user.code, name : user.username };
							});
						}
					});
				}
			}
			// setup userSelector dynamically.
			// call after getting users state.
			, setupUserSelector() {
				if (this.schema == undefined || this.schema.userSelector == undefined) {
					return;
				}

				this.schema.userSelector.fields.forEach(f => {
					if (f.model == "author") {
						f.values = this.users.map(user => {
							return { id : user.code, name : user.username };
						});
					}
				});
				// When user reload by F5, setting up userSelector is called after setting selectedUser and model value cleared by undefined.
				// So set initial value here again.
				this.setCurrentUser(this.me.code);
			}
			// setup projectSelector dynamically.
			// call after getting projects state.
			, setupProjectSelector() {
				if (this.schema == undefined || this.schema.projectSelector == undefined) {
					return;
				}

				this.schema.projectSelector.fields.forEach(f => {
					if (f.model == "code") {
						f.values = this.projects.map(p => {
							return { id : p.code, name : p.name }
						});
					}
				});
			}
		}
		, created() {
			this.$store.subscribe((mutation, state) => {
				if (mutation.type == `shared/${LOAD_PROJECTS}`
					|| mutation.type == `shared/${SET_CURRENT_PROJECT}`
				) {
					this.setupProjectsField();
					this.setupProjectSelector();
				}

				if (mutation.type == `shared/${LOAD_USERS}`) {
					this.setupAsigneeField();
					this.setupUserSelector();
				}
			});

			if (!this.currentWeek) {
				this.setCurrentWeek(moment().day(1).format("YYYY-MM-DD"));
			}

			if (this.users.length == 0) {
				this.getUsers({ mutation: `shared/${LOAD_USERS}` });	
			} else {
				this.setupAsigneeField();
				this.setupUserSelector();
			}

			if (this.projects.length == 0) {
				this.getProjects({ 
					options: { taskType : "project" }
					, mutation: `shared/${LOAD_PROJECTS}`
				});
			} else {
				this.setupProjectsField();
				this.setupProjectSelector();
			}
		}
	};
</script>