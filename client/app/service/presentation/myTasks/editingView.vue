<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
			.body
				.form
					vue-form-generator(:schema="schema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
					.buttons.flex.justify-end
						button.button.outline(@click="$emit('close')")
							i.icon.fa.fa-chevron-left
							| {{ _("Back") }}
						button.button.primary(@click="didPushSaveButton")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
						button.button.danger(v-if="!isNewEntity" @click="didPushCloseButton")
							i.icon.fa.fa-check
							| {{ _("Close") }}
		.panel(v-if="!isNewEntity")
			.header 親子関係
			.body
				treelist(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")

		.panel(v-if="!isNewEntity")
			.header Timeline
			.body
				time-line(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")
</template>
<script>
	import Vue from "vue";
    import AbstractView from "service/presentation/mixins/abstractView";
    import AbstractEditingView from "service/presentation/mixins/abstractView";

    import Task from "service/domain/entities/task";
    // import Treenode from "service/domain/entities/treenode";
    
	import { mapGetters } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
    import { cloneDeep, isArray } from "lodash";
    
	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView, AbstractEditingView ]
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
            let _rawValues = this.entity 
                ? this.entity.rawValues 
                : schemaUtils.createDefaultObject(this.schema);

			return {
				rawValues: _rawValues
				, options: {}
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
			
			// didPushSaveButton() {
			// 	if (this.validate()) {
			// 		return Promise.resolve().then(() => {
			// 			if ( this.isNewEntity ) {
			// 				return this.addTask(this.rawValues);
			// 			} else {
			// 				return this.editTask(this.rawValues);
			// 			}
			// 		}).then(() => {
			// 			this.$emit("close", this.rawValues);
			// 		});
					
			// 	} else {
			// 		// Validation error
			// 	}
			// }
			// , didPushCloseButton() {
			// 	if (this.validateInClosing()) {
			// 		return Promise.resolve().then(() => {
			// 			return this.closeTask(this.rawValues);
			// 		}).then(() => {
			// 			this.$emit("close", this.rawValues);
			// 		});
					
			// 	} else {
			// 		// Validation error
			// 	}
			// }
		}
		, created() {
			// this.pushCrumb({ id: this._uid, name: (this.entity ? this.entity.name : "新規作成") });
		}
	}
</script>
<style lang="scss">
</style>