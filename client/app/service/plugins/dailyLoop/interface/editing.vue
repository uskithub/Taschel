<template lang="pug">
	fieldset
		.panel
			.header {{ entity.title }}
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
						button.button.danger(v-if="rawValues.status >= 0" @click="didPushCloseButton")
							i.icon.fa.fa-save 
							| {{ _("Close") }}
</template>
<script>
	import Vue from "vue";
	import BaseEditing from "../../../fundamentals/mixins/baseEditing";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isArray } from "lodash";
	import moment from "moment";
	const _ = Vue.prototype._;

	export default {
		name : "WorkEditing"
		, mixins : [ BaseEditing ]
		, props : {
			entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, taskTree : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, schema : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
		}
		, data() {
			let _rawValues = this.entity ? this.entity.rawValues : schemaUtils.createDefaultObject(this.schema);
			if (!isArray(_rawValues.type)) {
				_rawValues.type = [ _rawValues.type ];
			}

			return {
				rawValues: _rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
			, treenodes() { return [this.taskTree]; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"editWork"
				, "closeWork"
			])
			, didPushSaveButton() {
				if (this.rawValues.status < 0) {
					if (this.validateInClosing() && this.validate()) {
						return Promise.resolve().then(() => {
							return this.editWork(this.rawValues);
						}).then(() => {
							this.$emit("close", this.rawValues);
						});
					} else {
						// Validation error
					} 
				} else {
					if (this.validate()) {
						return Promise.resolve().then(() => {
							return this.editWork(this.rawValues);
						}).then(() => {
							this.$emit("close", this.rawValues);
						});
					} else {
						// Validation error
					}
				}
			}
			// Usecase: a user cancels editing or adding a project.
			, didPushCancelButton() {
				this.$emit("close"); 
			}
			// Usecase: a user close the work.
			, didPushCloseButton() {
				if (this.validateInClosing()) {
					return Promise.resolve().then(() => {
						return this.closeWork(this.rawValues);
					}).then(() => {
						this.$emit("close", this.rawValues);
					});
				} else {
					// Validation error
				} 
			}
		}
		, created() {
		
			this.pushCrumb({ id: this._uid, name: this.entity.title });
		}
	}
</script>
<style lang="scss">

</style>