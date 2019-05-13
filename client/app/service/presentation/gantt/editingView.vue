<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
			.body
				.form
					vue-form-generator(:schema="dynamicSchema", :model="rawValues", :options="options", :is-new-model="isNewEntity" ref="form")
					.buttons.flex.justify-end
						button.button.outline(@click="didPushCancelButton")
							i.icon.fa.fa-chevron-left
							| {{ _("Back") }}
						button.button.primary(@click="didPushSaveButton")
							i.icon.fa.fa-save 
							| {{ _("Save") }}
		//- .panel
		//- 	.header 親子関係
		//- 	.body
		//- 		treelist(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")

		//- .panel
		//- 	.header Timeline
		//- 	.body
		//- 		time-line(:treenodes="treenodes" ref="legend" @arrange="didArrangeTask" @addIconDidPush="addIconDidPush")
</template>
<script>
	import Vue from "vue";
    import AbstractView from "service/presentation/mixins/abstractView";
	import AbstractEditingView from "service/presentation/mixins/abstractEditingView";
	
	import Task from "service/domain/entities/task";
	
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
			, parent : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, sibling : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, taskTree : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
		}
		, data() {
			let _entity = this.entity || this.parent.childTaskFactory();
			let rawValues = _entity.rawValues;
			if (this.sibling) {
				if (isArray(rawValues.dependencies)) {
					rawValues.dependencies.push(this.sibling.code);
				} else {
					rawValues.dependencies = [this.sibling.code];
				}
			}

			return {
				rawValues: rawValues
				, options: {}
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
            , header() {
				if (this.entity) {
					return this.entity.name;
				} else if (this.parent) {
					if (this.sibling) {
						return `${this.parent.name} に ${this.sibling.name} の後続タスクを追加`;
					} else {
						return `${this.parent.name} にタスクを追加`;
					}
				} else {
					return "新規作成"; 
				}
			}
            , dynamicSchema() { 
				let schema = {};
				schema.fields = Task.dynamicSchema(this.rawValues)
				return schema;
			}
			, treenodes() { return [this.taskTree]; }
		}
		, methods : {
			// ...mapActions([
			// 	// Usecases
			// 	"addTaskInProjectTree"
			// 	, "editTaskInProjectTree"
			// ])
			didPushSaveButton() {
				if (this.validate()) {
					// return Promise.resolve().then(() => {
					// 	if ( this.isNewEntity ) {
					// 		return this.addTaskInProjectTree(this.rawValues);
					// 	} else {
					// 		return this.editTaskInProjectTree(this.rawValues);
					// 	}
					// }).then(() => {
					// 	this.$emit("close", this.rawValues);
					// });
					
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
		}
		, created() {
			const title = (this.entity ? this.entity.name : (this.parent ? `${this.parent.name} にタスクを追加` : "新規作成"));
			// this.pushCrumb({ id: this._uid, name: title });
		}
	}
</script>
<style lang="scss">
</style>