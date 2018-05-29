<template lang="pug">
	.form
		vue-form-generator(:schema="schema.form", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
		.buttons.flex.justify-space-around
			button.button.primary(@click="onClickSaveButton")
				i.icon.fa.fa-save 
				| {{ _("Save") }}
			button.button.outline(@click="cancel")
				i.icon.fa.fa-close
				| {{ _("Cancel") }}
</template>
<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { SET_WAY_BACK, POP_CRUMB } from "../../fundamentals/mutationTypes";
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
			...mapMutations("environment/session", {
				setWayBack : SET_WAY_BACK
				, popCrumb : POP_CRUMB
			})
			, ...mapActions("environment/session", [
				// Usecases
				"createProject"
				, "updateProject"
			])
			, onClickSaveButton() {
				if (this.validate()) {
					return Promise.resolve().then(() => {
						if ( this.entity.code ) {
							return this.updateProject(this.rawValues);
						} else {
							return this.createProject(this.rawValues);
						}
					}).then(() => {
						this.$emit("close", this.rawValues);
					});
					
				} else {
					// Validation error
				}
			}
			// Usecase: a user cancels editing or adding a project.
			, cancel() {
				this.$emit("close"); 
				this.popCrumb();
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
			this.setWayBack(() => { 
				this.$emit("close"); 
				this.popCrumb();
			});
			this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="sass" scoped></style>