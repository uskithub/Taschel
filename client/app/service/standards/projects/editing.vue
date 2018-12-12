<template lang="pug">
	fieldset
		.panel
			.header {{ entity.name }}
			.body
				.form
					vue-form-generator(:schema="schema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
					.buttons.flex.justify-end
						button.button.primary(@click="didPushSaveButton")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
						button.button.outline(@click="didPushCancelButton")
							i.icon.fa.fa-close
							| {{ _("Cancel") }}
</template>
<script>
	import Vue from "vue";
	import BaseEditing from "../../fundamentals/mixins/baseEditing";
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
			// MIGRATION v1->2
			let rawValues = this.entity ? this.entity.rawValues : schemaUtils.createDefaultObject(this.schema);
			if (rawValues.projectType === undefined) {
				rawValues.projectType = projectTypes[1].id;
			}

			return {
				rawValues: rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"createProject"
				, "editProject"
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
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="scss">
</style>