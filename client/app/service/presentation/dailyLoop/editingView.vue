<template lang="pug">
	fieldset
		.panel
			.header {{ entity.title }}
			.body
				.form
					vue-form-generator(:schema="schema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
					.buttons.flex.justify-end
						button.button.outline(@click="$emit('endEditing')")
							i.icon.fa.fa-chevron-left
							| {{ _("Back") }}
						button.button.primary(@click="saveButtonDidPush")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
						button.button.danger(v-if="rawValues.status >= 0" @click="closeButtonDidPush")
							i.icon.fa.fa-save 
							| {{ _("Close") }}
						button.button.danger(v-if="rawValues.status >= 0 && false" @click="closeButtonDidPush($event, true)")
							i.icon.fa.fa-save 
							| {{ _("CloseWithTask") }}
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
			saveButtonDidPush() {
				if (this.rawValues.status < 0) {
					if (this.validateInClosing() && this.validate()) {
						this.$emit("save", this.rawValues);
					} else {
						// Validation error
					} 
				} else {
					if (this.validate()) {
						this.$emit("save", this.rawValues);
					} else {
						// Validation error
					}
				}
			}
			// Usecase: a user close the work.
			, closeButtonDidPush(e, withTask = false) {
				if (this.validateInClosing()) {
					this.$emit("close", this.rawValues, withTask);
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
<style lang="scss"></style>