<template lang="pug">
	fieldset
		.panel
			.header {{ schema.title }}
			.body
				.kanban-system-container
					ul.kanban-board-container
						li.kanban-board.kanban-board-daily-works(key="works", :class="{ active : isHighOrderReivew }"
							@click.prevent.stop="didSelect($event, null, works.length+1)"
						)
							span.kanban-board-header
								legend {{ "works" }}
							div.drag-options
							ul.kanban-list(data-code="daily" ref="works")
								li.kanban-item(v-if="template.highOrderReview.highOrderAwakening" key="HighOrderReview") 
									slot(name="HighOrderAwakening")
										strong {{ _("HighOrderAwakening") }}
									.text-muted {{ template.highOrderReview.highOrderAwakening }}
									message(v-if="template.highOrderReview.comments" v-for="comment in template.highOrderReview.comments", :key="comment.code", :comment="comment", :user="getUser(comment.author)")
								li.kanban-item(v-for="(work, i) in works", :class="{ active : index == i }", :data-code="work.code", :key="work.code" ref="items"
									@click.prevent.stop="didSelect($event, work, i)"
								)
									slot(:name="work.title")
										strong {{ work.title }}
										.text-muted
											dl(v-for="item in description(work)", :key="item.key")
												dt {{ item.title }}
												dd {{ item.value }}
									message(v-for="comment in work.comments", :key="comment.code", :comment="comment", :user="getUser(comment.author)")
						li.kanban-board.form(key="form")
							vue-form-generator(:schema="dynamicForm", :model="dynamicModel", :options="options", ref="form", :is-new-model="isNewModel")

							.errors.text-center
								div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
									strong {{ item.error }}

							.buttons.flex.justify-space-around(v-if="!isAudience")
								button.button.primary(@click="didPushSaveButton", :disabled="!isSaveButtonEnable")
									i.icon.fa.fa-save 
									| {{ saveButtonCaption }}
								button.button.outline(v-if="options.isSkipButtonEnable" @click="didPushSkipButton", :disabled="!isSkipButtonEnable")
									i.icon.fa.fa-save
									| {{ schema.resources.skipCaption || _("Skip") }}
								button.button.outline(@click="didPushCancelButton", :disabled="!isCancelButtonEnable")
									i.icon.fa.fa-close
									| {{ schema.resources.cancelCaption || _("Cancel") }}
							.buttons.flex.justify-space-around(v-else)
								button.button.outline(@click="didPushCancelButton", :disabled="!isCancelButtonEnable")
									i.icon.fa.fa-close
									| {{ schema.resources.cancelCaption || _("Cancel") }}	
</template>
<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { schema as schemaUtils } from "vue-form-generator";
	import { cloneDeep, isArray } from "lodash";
	import moment from "moment";
	const _ = Vue.prototype._;

	export default {
		name : "WorkEditing"
		, mixins : [ Base ]
		, props : {
			entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, reviewingWorks : {
				type: Array
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

			if (_rawValues.actualStart === undefined) _rawValues.actualStart = moment(_rawValues.start).format("HH:mm");
			if (_rawValues.actualEnd === undefined) _rawValues.actualEnd = moment().format("HH:mm");

			return {
				rawValues : _rawValues
				, options : {}
				, index : 0
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
			, treenodes() { return [this.taskTree]; }
		}
		, methods : {
			...mapActions([
				// Usecases
				"editWork"
				, "closeWork"
			])
			, didSelect(e, work, index) {
				console.log(work, index);
				this.index = index;
			}
			, didPushSaveButton() {
				if (this.validate()) {
					return Promise.resolve().then(() => {
						return this.editWork(this.rawValues);
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
			, didPushSkipButton() {
				this.$emit("close"); 
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
			this.pushCrumb({ id: this._uid, name: "revyu" });
		}
	}
</script>
<style lang="scss" scoped>

	.panel {
		margin-bottom: 20px;
	}

</style>