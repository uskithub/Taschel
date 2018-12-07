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
						button.button.danger(@click="didPushCloseButton")
							i.icon.fa.fa-save 
							| {{ _("Close") }}
</template>
<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isArray } from "lodash";
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

			if (_rawValues.actualStart === undefined) _rawValues.actualStart = moment(_rawValues.start).format("HH:mm");
			if (_rawValues.actualEnd === undefined) _rawValues.actualEnd = moment().format("HH:mm");

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
			// Usecase: a user cancels editing or adding a project.
			, didPushCancelButton() {
				this.$emit("close"); 
			}
			, didPushCloseButton() {
				this.$emit("close"); 
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