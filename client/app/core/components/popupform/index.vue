<template lang="pug">
	.popup-container
		.popup
			.panel
				.header {{ title }}
				.body 
					.form
						vue-form-generator(:schema="formSchema", :model="model", :options="options", ref="form", :is-new-model="isNewModel")

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
			, me : {
				type: Object
				// , required: true
				, validator: function(value) { return true; } // TODO
			}
			, selected : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, saveModel : {
				type: Function
				, required: true
			}
			, updateModel : {
				type: Function
				// , required: true
			}
			, deleteModel : {
				type: Function
				// , required: true
			}
			, endEditing : {
				type: Function
				, required: true
			}
		}
		, data() {
			// createdより早くmodelが参照されるので、ここで詰めている
			let _model = null;
			let _isNewModel = false;
			let _title = _("CreateNewModel");	
			let _isProjectSelectable = false;		

			if (this.selected.length == 1) {
				_model = cloneDeep(this.selected[0]);
				if (_model.root != -1) {
					if (_model.root.code) {
						_model.root_code = _model.root.code;
					} else {
						_model.root_code = _model.root;
					}
				}
				_title = `${_model.name} を更新`;
			}
			else if (this.selected.length > 1) {
				_model = schemaUtils.mergeMultiObjectFields(this.schema.form, this.selected);
				// TODO
				_title = `${_model.name} を更新`;
			} else {
				_model = schemaUtils.createDefaultObject(this.schema.form);
				_model.asignee_code = this.me.code;
				_isNewModel = true;
				_isProjectSelectable = true;
			}
				
			return {
				model: _model
				, isNewModel: _isNewModel
				, title : _title
				, isProjectSelectable : _isProjectSelectable
			};
		}
		, computed: {
			formSchema() {
				if (this.isProjectSelectable) {
					let fields = cloneDeep(this.schema.form.fields).map(f => {
						if (f.model == "root_code") {
							f.readonly = false;
							f.disabled = false;
						}
						return f;
					});
					return { fields };
				} else {
					return this.schema.form;
				}
			}
			, options() { return this.schema.options || {}; }

			, isSaveButtonEnable() { 
				return this.options.isSaveButtonEnable !== false
					; 
			}
			, isCloseButtonEnable() { 
				return !this.isNewModel 
					// && this.selected.status > -1 
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
					&& this.options.enableDeleteButton !== false
					;
			}
			, isCancelButtonEnable() { 
				return this.options.enableCancelButton !== false;
			}
			, validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		}
		, watch : {
			selected() {
			}
		}
		, methods: {

			buttonSaveDidPush() {
				console.log("Save model...", this.model);
				if (this.options.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel)
						this.saveModel(this.model);
					else
						this.updateModel(this.model);

				} else {
					// Validation error
				}
			}

			, buttonCloseDidPush() {
				// TODO
				console.log("close button pushed");
			}

			, buttonCloneDidPush() {
				// TODO: projectを選択できるようにする
				console.log("Clone model...");
				this.isNewModel = true;
				this.isProjectSelectable = true;
				this.title = `${this.model.name} を元に新規作成`;

				let baseModel = this.model;
				let clonedModel = cloneDeep(baseModel);
				clonedModel.id = null;
				clonedModel.code = null;
				clonedModel.works = [];
				this.model = clonedModel;
			}

			, buttonBreakdownDidPush() {
				// TODO: projectを選択できるようにする
				console.log("Breakdown model...");
				this.isNewModel = true;
				this.title = `${this.model.name} をブレークダウン`;

				let baseModel = this.model;

				let brokedownModel = cloneDeep(baseModel);
				brokedownModel.id = null;
				brokedownModel.code = null;
				brokedownModel.type = "step";
				brokedownModel.name = null;
				brokedownModel.purpose = `${this.model.goal} にするため`;
				brokedownModel.goal = null;
				brokedownModel.children = [];
				brokedownModel.works = [];
				if (this.model.root != -1) {
					if (this.model.root.code) {
						brokedownModel.root_code = this.model.root.code;
					} else {
						brokedownModel.root_code = this.model.root;
					}
				} else {
					// brokedownModel.root_code = this.model.code;
				}
				brokedownModel.parent_code = this.model.code;
				brokedownModel.asignee_code = undefined;
				this.model = brokedownModel;
			}

			, buttonDeleteDidPush() {
				// TODO:
				if (this.selected.length > 0) {
					this.selected.forEach(row => this.deleteModel(row));
				}
			}

			, buttonCancelDidPush() {
				// TODO
				console.log("cancel button pushed");
				this.endEditing();
			}

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