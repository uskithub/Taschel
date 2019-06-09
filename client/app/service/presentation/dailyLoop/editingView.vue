<template lang="pug">
	fieldset
		.panel
			.header {{ rawValues.title }}
			.body
				.form
					vue-form-generator(:schema="schema", :model="model", :options="options" ref="form")
					.buttons.flex.justify-end
						button.button.outline(@click="$emit('endEditing')")
							i.icon.fa.fa-chevron-left
							| {{ _("Back") }}
						button.button.primary(@click="saveButtonDidPush")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
						button.button.danger(v-if="model.status >= 0" @click="closeButtonDidPush")
							i.icon.fa.fa-save 
							| {{ _("Close") }}
						button.button.danger(v-if="model.status >= 0" @click="closeButtonDidPush($event, true)")
							i.icon.fa.fa-save 
							| {{ _("CloseWithTask") }}
						button.button.danger(v-if="model.status >= 0" @click="deleteButtonDidPush($event, true)")
							i.icon.fa.fa-save 
							| {{ _("Delete") }}
</template>
<script>
	import Vue from "vue";
	import AbstractView from "system/mixins/abstractView";
    import AbstractEditingView from "system/mixins/abstractEditingView";
	
	import { mapGetters } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isArray } from "lodash";
	
	const _ = Vue.prototype._;

	export default {
		mixins : [ 
            AbstractView
            , AbstractEditingView 
        ]
		, props : {
			rawValues : {
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
			return {
				model: this.rawValues
				, options: {}
			};
		}
		, computed: {
			treenodes() { return [this.taskTree]; }
		}
		, methods : {
			saveButtonDidPush() {
				if (this.model.status < 0) {
					if (this.validateInClosing() && this.validate()) {
						this.$emit("save", this.model);
					} else {
						// Validation error
					} 
				} else {
					if (this.validate()) {
						this.$emit("save", this.model);
					} else {
						// Validation error
					}
				}
			}
			// Usecase: a user close the work.
			, closeButtonDidPush(e, withTask = false) {
				if (this.validateInClosing()) {
					this.$emit("close", this.model, withTask);
				} else {
					// Validation error
				} 
			}
			, deleteButtonDidPush(e) {
				this.$emit("delete", this.model);
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: this.rawValues.title });
		}
	}
</script>
<style lang="scss"></style>