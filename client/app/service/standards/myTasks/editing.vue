<template lang="pug">
	.form
		vue-form-generator(:schema="schema.form", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
		.buttons.flex.justify-space-around
			button.button.primary(@click="didPushSaveButton")
				i.icon.fa.fa-save 
				| {{ _("Save") }}
			button.button.outline(@click="didPushCancelButton")
				i.icon.fa.fa-close
				| {{ _("Cancel") }}
</template>
<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";
	const _ = Vue.prototype._;

	export default {
		mixins : [ Base ]
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
			return {
				rawValues: this.entity ? this.entity.rawValues : schemaUtils.createDefaultObject(this.schema.form)
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === undefined; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"createTask"
				, "updateTask"
			])
			, didPushSaveButton() {
				if (this.validate()) {
					return Promise.resolve().then(() => {
						if ( this.isNewEntity ) {
							return this.updateTask(this.rawValues);
						} else {
							return this.createTask(this.rawValues);
						}
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
			this.setWayBackOnPreviousCrumb(() => { 
				this.$emit("close"); 
			});
			this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="sass" scoped></style>