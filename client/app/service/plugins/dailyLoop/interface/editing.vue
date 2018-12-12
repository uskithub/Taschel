<template lang="pug">
	fieldset
		.panel
			.header 概要
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
	import Base from "../../../fundamentals/mixins/base";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { get as objGet, cloneDeep, isArray, isFunction } from "lodash";
	import moment from "moment";
	const _ = Vue.prototype._;

	export default {
		name : "WorkEditing"
		, mixins : [ Base ]
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
			// Application Service:
			, validate() {
				let res = this.$refs.form.validate();

				if (!res) {
					// Set focus to first input with error
					this.$nextTick(() => {
						let el = document.querySelector("div.form tr.error input:nth-child(1)");
						if (el)
							el.focus();
					});
				}
				return res;	
			}
			// TODO: editing向けのmixinsに寄せる
			// @see https://github.com/vue-generators/vue-form-generator/blob/master/src/formGenerator.vue#L316
			, validateInClosing(isAsync = null) {
				let form = this.$refs.form;

				form.$children.forEach(child => {
					// notice: the required option not work without the validator option.
					if (child.schema.requiredInClosing) {
						child.schema._required = child.schema.required;
						child.schema.required = true;
					}
				});

				if (isAsync === null) {
					isAsync = objGet(form.options, "validateAsync", false);
				}
				form.clearValidationErrors();
				let fields = [];
				let results = [];
				form.$children.forEach(child => {
					if (isFunction(child.validate)) {
						fields.push(child); // keep track of validated children
						results.push(child.validate(true));
					}
				});
				let handleErrors = (errors) => {
					let formErrors = [];
					errors.forEach((err, i) => {
						if (isArray(err) && err.length > 0) {
							err.forEach(error => {
								formErrors.push({
									field: fields[i].schema,
									error: error,
								});
							});
						}
					});
					form.errors = formErrors;
					let isValid = formErrors.length == 0;
					form.$emit("validated", isValid, formErrors);

					form.$children.forEach(child => {
						if (child.schema.requiredInClosing) {
							child.schema.required = child.schema._required;
						}
					});

					return isAsync ? formErrors : isValid;
				};

				if(!isAsync) {
					return handleErrors(results);
				}

				return Promise.all(results).then(handleErrors);

			}
		}
		, created() {
			this.setWayBackOnLastCrumb(() => { 
				this.$emit("close"); 
			});
			this.pushCrumb({ id: this._uid, name: this.entity.title });
		}
	}
</script>
<style lang="scss" scoped>

	.panel {
		margin-bottom: 20px;
	}

</style>