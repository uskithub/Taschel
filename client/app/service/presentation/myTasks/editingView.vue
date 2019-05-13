<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
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
						button.button.danger(v-if="!isNewEntity" @click="closeButtonDidPush")
							i.icon.fa.fa-check
							| {{ _("Close") }}
		.panel(v-if="!isNewEntity")
			.header 親子関係
			.body
				treelist(:treenodes="treenodes", :foldingConditionMap="foldingConditionMap" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")

		.panel(v-if="!isNewEntity")
			.header Timeline
			.body
				time-line(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")
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
            schema : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
		}
		, data() {
            let _rawValues = this.entity 
                ? this.entity.rawValues 
                : schemaUtils.createDefaultObject(this.schema);

			return {
				rawValues: _rawValues
                , options: {}
                , foldingConditionMap: {}
			};
		}
		, computed: {
            ...mapGetters([
                "taskTree"
			])
			, isNewEntity() { return this.entity === null; }
			, header() { return this.entity ? this.entity.name : "新規作成"; }
			, treenodes() { return [this.taskTree]; }
		}
		, methods : {
			
			saveButtonDidPush() {
				if (this.validate()) {
					this.$emit("save", this.rawValues, this.isNewEntity);
				} else {
					// Validation error
				}
			}
			, closeButtonDidPush() {
				if (this.validateInClosing()) {
                    this.$emit("close", this.rawValues);
				} else {
					// Validation error
				}
			}
			, didArrangeTask() {
				// TODO
			}
			, addIconDidPush() {
				// TODO
			}
		}
		, created() {
			this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="scss"></style>