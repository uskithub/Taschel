<template lang="pug">
	fieldset
		.panel
			.header 概要
			.body
				.form
					vue-form-generator(:schema="schema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
					.buttons.flex.justify-end
						button.button.outline(@click="didPushCancelButton")
							i.icon.fa.fa-chevron-left
							| {{ _("Back") }}
						button.button.primary(@click="didPushSaveButton")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
		.panel
			.header 親子関係
			.body
				treelist(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")

		.panel
			.header Timeline
			.body
				time-line(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")
</template>
<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import Treenode from "../../plugins/gantt/treenode";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isArray } from "lodash";
	const _ = Vue.prototype._;

	export default {
		name : "TaskEditing"
		, mixins : [ Base ]
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
			if (!isArray(_rawValues.type)) {
				_rawValues.type = [ _rawValues.type ];
			}

			return {
				crumb: this.entity.name
				, rawValues: _rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
			, treenodes() { return [this.taskTree]; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"addTask"
				, "editTask"
			])
			, didPushSaveButton() {
				if (this.validate()) {
					return Promise.resolve().then(() => {
						if ( this.isNewEntity ) {
							return this.addTask(this.rawValues);
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
			// Usecase: a user cancels editing or adding a project.
			, didPushCancelButton() {
				this.$emit("close"); 
			}
			, didArrangeTask() {
				// TODO
			}
			, addIconDidPush() {
				// TODO
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
			this.setWayBackOnLastCrumb(() => { 
				this.$emit("close"); 
			});
		}
	}
</script>
<style lang="scss" scoped>

	.panel {
		margin-bottom: 20px;
	}

</style>