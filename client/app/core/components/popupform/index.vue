<template lang="pug">
	.popup-container
		.popup
			.panel
				.header {{ schema.title }}
				.body 
					.form
						vue-form-generator(:schema="schema.form", :model="model", :options="options", ref="form", :is-new-model="isNewModel")

						.errors.text-center
							div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
								strong {{ item.error }}

						.buttons.flex.justify-space-around
							button.button.primary(@click="buttonSaveDidPush", :disabled="!isSaveButtonEnable")
								i.icon.fa.fa-save 
								| {{ schema.resources.saveCaption || _("Save") }}
							button.button.outline(@click="buttonCloseDidPush", :disabled="!isCloseButtonEnable")
								i.icon.fa.fa-save
								| {{ schema.resources.closeCaption || _("Close") }}
							button.button.outline(@click="buttonBreakdownDidPush", :disabled="!isBreakdownButtonEnable")
								i.icon.fa.fa-code-fork 
								| {{ schema.resources.breakdownCaption || _("Breakdown") }}
							button.button.outline(@click="buttonCloneDidPush", :disabled="!isCloneButtonEnable")
								i.icon.fa.fa-clone
								| {{ schema.resources.cloneCaption || _("Clone") }}
							button.button.danger(@click="buttonDeleteDidPush", :disabled="!isDeleteButtonEnable")
								i.icon.fa.fa-trash 
								| {{ schema.resources.deleteCaption || _("Delete") }}
							button.button.outline(@click="buttonCancelDidPush", :disabled="!isCancelButtonEnable")
								i.icon.fa.fa-close
								| {{ schema.resources.cancelCaption || _("Cancel") }}
				.block
					//- button.button.success(@click="schema.buttons[0].action") {{ schema.buttons[0].label }}
				
</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import { find, cloneDeep, isFunction } from "lodash";

	export default {

		// properties set by it's parent component.
		// somtimes, parent components set their methods as props.
		// it looks like cocoa's delegating.
		props: {
			schema : {
				type: Object
      			, required: true
				, validator: function(value) { return true; } // TODO
			}
			, template : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
		}
		, data() {
			// createdより早くmodelが参照されるので、ここで詰めている
			return {
				model: this.template
			};
		}
		, computed: {
			isNewModel() { return this.model.code == null; }
			, options() { return this.schema.options || {}; }
			, isSaveButtonEnable() { 
				return this.options.isSaveButtonEnable !== false
					; 
			}
			, isCloseButtonEnable() { 
				return !this.isNewModel
					&& this.options.isCloseButtonEnable !== false
					; 
			}
			, isBreakdownButtonEnable() { 
				return !this.isNewModel 
					&& this.options.isBreakdownButtonEnable !== false
					;
				}
			, isCloneButtonEnable() { 
				return !this.isNewModel 
					&& this.options.isCloneButtonEnable !== false
					;
			}
			, isDeleteButtonEnable() { 
				return !this.isNewModel 
					&& this.options.isDeleteButtonEnable !== false
					;
			}
			, isCancelButtonEnable() { 
				return this.options.isCancelButtonEnable !== false;
			}
			, validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		}
		, watch : {
			schema(newSchema) {
				console.log("●", newSchema);
			}
			,template(newTemplate) {
				this.model = newTemplate;
			}
		}
		, methods: {

			buttonSaveDidPush() {
				if (this.options.validateBeforeSave === false ||  this.validate()) {
					this.$emit("save", this.model);
				} else {
					// Validation error
				}
			}
			, buttonCloseDidPush() {
				// TODO
				console.log("close button pushed");
			}
			, buttonCloneDidPush() { this.$emit("clone"); }
			, buttonBreakdownDidPush() { this.$emit("breakdown"); }
			, buttonDeleteDidPush() { this.$emit("remove"); }	// deleteは予約語なので怒られる
			, buttonCancelDidPush() { this.$emit("cancel"); }

			, validate() {
				let res = this.$refs.form.validate();

				if (this.schema.events && isFunction(this.schema.events.onValidated)) {
					this.schema.events.onValidated(this.model, this.$refs.form.errors, this.schema);
				}

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
		}
	};
	
</script>

<style lang="scss">

	.popup-container {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999;
	}

	.popup {
		position: absolute;
		top: 200px;
		left: 280px;
		right: 100px;
		bottom: 0;
		margin: auto;
		transition: all .4s ease;
		font-size: 0.8em;

		.panel {
			background-color: rgba(16, 67, 87, 0.8);
		}
	}

</style>