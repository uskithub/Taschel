<template lang="pug">
	fieldset
		.panel
			.header {{ header }}
			.body
				.kanban-system-container
					ul.kanban-board-container
						li.kanban-board.kanban-board-daily-works(key="works", :class="{ active : isHighOrderReview }"
							@click.prevent.stop="didSelect($event, null, reviewingWorks.length+1)"
						)
							span.kanban-board-header
								legend {{ "works" }}
							div.drag-options
							ul.kanban-list(data-code="daily" ref="works")
								li.kanban-item(v-if="entity && entity.highOrderAwakening" key="HighOrderReview") 
									slot(name="HighOrderAwakening")
										strong {{ _("HighOrderAwakening") }}
									.text-muted {{ entity.highOrderAwakening }}
									message(v-if="entity.comments" v-for="comment in entity.comments", :key="comment.code", :comment="comment", :user="getUser(comment.author)")
								li.kanban-item(v-for="(work, i) in reviewingWorks", :class="{ active : index == i }", :data-code="work.code", :key="work.code" ref="items"
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
							vue-form-generator(:schema="dynamicForm", :model="dynamicModel", :options="options", ref="form", :is-new-model="isNewEntity")

							.errors.text-center
								div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
									strong {{ item.error }}

							.buttons.flex.justify-space-around
								button.button.primary(@click="didPushSaveButton")
									i.icon.fa.fa-save 
									| {{ dynamicButtonCaption }}
								button.button.outline(v-if="options.isSkipButtonEnable" @click="didPushSkipButton", :disabled="!isSkipButtonEnable")
									i.icon.fa.fa-save
									| {{ _("Skip") }}
								button.button.outline(@click="didPushCancelButton")
									i.icon.fa.fa-close
									| {{ _("Cancel") }}
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
		name : "Reviewing"
		, mixins : [ Base ]
		, props : {
			date : {
				type: Object // moment object
				, validator: (value) => { return true; } // TODO
			}
			, entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
			, reviewingWorks : {
				type: Array
				, validator: (value) => { return true; } // TODO
			}
			, schema : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
		}
		, data() {
			let _rawValues = this.entity ? this.entity.rawValues : schemaUtils.createDefaultObject(this.schema);	
			if (!this.entity) _rawValues.works = this.reviewingWorks.map(w => w.rawValues);
		
			return {
				rawValues : _rawValues
				, options : {}
				, index : 0
			};
		}
		, computed: {
			isNewEntity() { return this.entity === null; }
			, header() { return `${ this.date.format("MM/DD") } の振り返り`; }
			, isHighOrderReview() {
				return this.index >= this.reviewingWorks.length;
			}
			, dynamicForm() {
				if (this.index >= this.reviewingWorks.length) {
					return this.schema.groups[1];
				} else {
					return this.schema.groups[0];
				}
			}
			, dynamicModel() {
				if (this.index >= this.reviewingWorks.length) {
					return this.rawValues;
				} else {
					return this.rawValues.works[this.index];
				}
			}
			, validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) return this.$refs.form.errors;
				return [];
			}
			, isSkipButtonEnable() {
				return !(this.index >= this.reviewingWorks.length);
			}
			, dynamicButtonCaption() {
				if (this.index >= this.reviewingWorks.length) {
					return _("Save");
				} else {
					return _("Next");
				}
			}
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
			, description(work) {
				let result = [
					{
						key: "description"
						, title: _("Description")
						, value: work.description
					}
				];
				if (work.goodSide) { 
					result.push({
						key: "goodSide"
						, title: _("GoodSide")
						, value: work.goodSide
					});	
				}
				if (work.badSide) {
					result.push({
						key: "badSide"
						, title: _("BadSide")
						, value: work.badSide
					});
				}
				if (work.improvement) {
					result.push({
						key: "improvement"
						, title: _("Improvement")
						, value: work.improvement
					});
				}
				return result;
			}
		}
		, created() {
			this.setWayBackOnLastCrumb(() => { 
				this.$emit("close"); 
			});
			this.pushCrumb({ id: this._uid, name: `${ this.date.format("MM/DD") } の振り返り` });
		}
	}
</script>
<style lang="scss" scoped>

	.panel {
		margin-bottom: 20px;
	}

	.kanban-board {
		&-daily-works {
			border: 2px solid transparent;

			&.active {
				border: 2px solid yellow;
			}
		}

		.kanban-item {
			border: 2px solid transparent;

			&.active {
				border: 2px solid yellow;
			}
		}
	}

</style>