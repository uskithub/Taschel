<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
			.body
				.form
					vue-form-generator(:schema="schema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
					.buttons.flex.justify-end
						button.button.outline(@click="didPushCancelButton")
							i.icon.fa.fa-chevron-left
							| {{ _("Back") }}
						button.button.primary(@click="didPushSaveButton")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
						button.button.danger(v-if="!isNewEntity && rawValues.status >= 0" @click="didPushCloseButton")
							i.icon.fa.fa-save 
							| {{ _("Close") }}

</template>
<script>
	import Vue from "vue";
	import BaseEditing from "../../fundamentals/mixins/baseEditing";
	import Project from "../../fundamentals/entities/project";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import { projectTypes } from "../../constants";

	const _ = Vue.prototype._;

	export default {
		mixins : [ BaseEditing ]
		, props : {
			entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, schema : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
		}
		, data() {
			let _entity = this.entity || Project.newProjectFactory();

			return {
				rawValues: _entity.rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
			, header() { return this.entity ? this.entity.name : "新規作成"; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"createProject"
				, "editProject"
				, "closeProject"
			])
			, didPushSaveButton() {
				if (this.validate()) {
					return Promise.resolve().then(() => {
						if ( this.isNewEntity ) {
							return this.createProject(this.rawValues);
						} else {
							return this.editProject(this.rawValues);
						}
					}).then(() => {
						this.$emit("close", this.rawValues);
					});
	
				} else {
					// TODO: Validation error
				}
			}
			// Usecase: a user cancels editing or adding a project.
			, didPushCancelButton() {
				this.$emit("close");
			}
			// Usecase: a user close the project.
			, didPushCloseButton() {
				if (this.validateInClosing()) {
					return Promise.resolve().then(() => {
						return this.closeProject(this.rawValues);
					}).then(() => {
						this.$emit("close", this.rawValues);
					});
				} else {
					// Validation error
				}
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="scss">
</style>