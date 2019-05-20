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
						button.button.danger(v-if="!isNewEntity && rawValues.status >= 0" @click="closeButtonDidPush")
							i.icon.fa.fa-save 
							| {{ _("Close") }}

</template>
<script>
	import Vue from "vue";
	import AbstractView from "system/mixins/abstractView";
    import AbstractEditingView from "system/mixins/abstractEditingView";
	
	import { mapGetters } from "vuex";
    import Project from "service/domain/entities/project";

	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep } from "lodash";

	import { projectTypes } from "service/constants";

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
		, computed : {
			...mapGetters([
				"usersOfCurrentOrganization"
			])
		}
		, data() {
			let _entity = this.entity || Project.newProjectFactory();

			return {
				rawValues: _entity.rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
			, header() { return this.entity ? this.entity.name : "新規作成"; }
		}
		, methods : {

			saveButtonDidPush() {
				if (this.validate()) {
                    this.$emit("save", this.rawValues, this.isNewEntity);
				} else {
					// TODO: Validation error
				}
			}
			, closeButtonDidPush() {
				if (this.validateInClosing()) {
					this.$emit("close", this.rawValues);
				} else {
					// Validation error
				}
			}
		}
		, created() {
			// this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="scss"></style>