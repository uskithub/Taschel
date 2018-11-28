<template lang="pug">
	.container
		.table(v-if="parent !== undefined")
			span {{ _("Parent") }}
			table
				tbody
					tr
						th {{ _("Parent Name") }}
						td {{ parent.name }}
					tr
						th {{ _("Parent Purpose") }}
						td {{ parent.purpose }}
					tr
						th {{ _("Parent Goal") }}
						td {{ parent.goal }}
		.form
			vue-form-generator(:schema="schema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
			.buttons.flex.justify-space-around
				button.button.primary(@click="didPushSaveButton")
					i.icon.fa.fa-save 
					| {{ _("Save") }}
				button.button.outline(@click="$emit('close', $event)")
					i.icon.fa.fa-close
					| {{ _("Cancel") }}
</template>
<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import { mapGetters, mapActions } from "vuex";
	import { cloneDeep, isArray } from "lodash";
	const _ = Vue.prototype._;

	export default {
		name: "TaskForm"
		, props : {
			entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, parent : {
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
			if (!isArray(_rawValues.type)) {
				_rawValues.type = [ _rawValues.type ];
			}

			return {
				rawValues: _rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity.code === undefined; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"addTaskToProject"
				, "editTask"
			])
			// Interfacial Operations
			, didPushSaveButton() {
				if (this.validate()) {
					return Promise.resolve().then(() => {
						if ( this.isNewEntity ) {
							return this.addTaskToProject(this.rawValues);
						} else {
							return this.editTask(this.rawValues);
						}
					}).then(() => {
						this.$emit("close", this.rawValues);
					});
					
				} else {
					// Validation error
				}
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

		}
	}
</script>
<style lang="scss" scoped></style>