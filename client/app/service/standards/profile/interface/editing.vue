<template lang="pug">
	.form
		vue-form-generator(:schema="schema.form", :model="model", :options="options", :is-new-model="isNewModel" ref="form")
		.buttons.flex.justify-space-around
			button.button.primary(@click="onSave")
				i.icon.fa.fa-save 
				| {{ _("Save") }}
			button.button.outline(@click="onCancel")
				i.icon.fa.fa-close
				| {{ _("Cancel") }}
</template>
<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { LOAD_TASKS, SELECT_TASK, SET_WAY_BACK, POP_CRUMB } from "../../../fundamentals/mutationTypes";
	import { cloneDeep } from "lodash";
	const _ = Vue.prototype._;

	export default {
		mixins : [ Base ]
		, props : {
			target : {
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
				model: this.target ? cloneDeep(this.target) : schemaUtils.createDefaultObject(this.schema.form)
				, options: {}
			};
		}
		, computed: {
			isNewModel() { return this.model.code === undefined; }
		}
		, methods : {
			...mapMutations("environment/session", {
				setWayBack : SET_WAY_BACK
				, popCrumb : POP_CRUMB
			})
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
			, onSave() {
				if (this.validate()) {
					this.$emit("save", this.model);
				} else {
					// Validation error
				}
			}
			, onCancel() {
				this.$emit("close"); 
				this.popCrumb();
			}
		}
		, created() {
			this.setWayBack(() => { 
				this.$emit("close"); 
				this.popCrumb();
			});
			this.pushCrumb({ id: this._uid, name: (this.target ? this.target.name : "新規作成") });
		}
	}
</script>
<style lang="sass" scoped></style>