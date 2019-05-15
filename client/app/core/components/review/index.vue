<template lang="pug">
	.popup-container
		.popup
			.panel
				.header {{ schema.title }}
				.body 
					.kanban-system-container
						ul.kanban-board-container
							li.kanban-board.kanban-board-daily-works(key="works", :class="{ active : isHighOrderReivew }"
								@click.prevent.stop="select($event, null, works.length+1)"
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
										@click.prevent.stop="select($event, work, i)"
									)
										work-review(:work="work")
										message(v-for="comment in work.comments", :key="comment.code", :comment="comment", :user="getUser(comment.author)")
							li.kanban-board.form(key="form")
								vue-form-generator(:schema="dynamicForm", :model="dynamicModel", :options="options", ref="form", :is-new-model="isNewModel")

								.errors.text-center
									div.alert.alert-danger(v-for="(item, index) in validationErrors", :key="index") {{ item.field.label }}: 
										strong {{ item.error }}

								.buttons.flex.justify-space-around(v-if="!isAudience")
									button.button.primary(@click="buttonSaveDidPush", :disabled="!isSaveButtonEnable")
										i.icon.fa.fa-save 
										| {{ saveButtonCaption }}
									button.button.outline(v-if="options.isSkipButtonEnable" @click="buttonSkipDidPush", :disabled="!isSkipButtonEnable")
										i.icon.fa.fa-save
										| {{ schema.resources.skipCaption || _("Skip") }}
									button.button.outline(@click="buttonCancelDidPush", :disabled="!isCancelButtonEnable")
										i.icon.fa.fa-close
										| {{ schema.resources.cancelCaption || _("Cancel") }}
								.buttons.flex.justify-space-around(v-else)
									button.button.outline(@click="buttonCancelDidPush", :disabled="!isCancelButtonEnable")
										i.icon.fa.fa-close
										| {{ schema.resources.cancelCaption || _("Cancel") }}	

				.block
					//- button.button.success(@click="schema.buttons[0].action") {{ schema.buttons[0].label }}
				
</template>

<script>
	import Vue from "vue";

	import "jquery";
	import "bootstrap";
	import "eonasdan-bootstrap-datetimepicker";
	import "ion-rangeslider";
	import "ion-rangeslider/css/ion.rangeSlider.css";
	import "ion-rangeslider/css/ion.rangeSlider.skinFlat.css";

	import WorkReview from "./workReview";

	import Message from "../message";
	import { schema as schemaUtils } from "vue-form-generator";
	import { get as objGet, find, cloneDeep, isArray, isFunction } from "lodash";
	import { mapGetters } from "vuex";

	const isHighOrderReivew = (works, index) => {
		return index >= works.length;
	};

	export default {
		name: "Review"
        , components: {
			Message
			, WorkReview
		}
		// properties set by it's parent component.
		// somtimes, parent components set their methods as props.
		// it looks like cocoa's delegating.
		, props: {
			schema: {
				type: Object
				, required: true
				, validator: function(value) {
					// TODO
					console.log("schema.reviewForm", value);
					return true;
				}
			}
			, works: {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, template: {
				type: Object
				, validator: function(value) {
					// TODO
					console.log("model.template", value);
					return true;
				}
			}
			, isAudience: {
				type: Boolean
				, default: false
			}
		}
		, data() {
			// createdより早くmodelが参照されるので、ここで詰めている
			return { 
				model: cloneDeep(this.template)
				, index: (this.template.highOrderReview.code) ? this.template.reviewOfWorks.length : 0
			};
		}
		, computed: {
			...mapGetters("shared", [
				"users"
			])
			, isNewModel() { return this.model.code == null; }
			, options() { return this.schema.options || {}; }
			, isSaveButtonEnable() { return this.options.isSaveButtonEnable !== false; }
			, isSkipButtonEnable() { return this.options.isSkipButtonEnable !== false && !isHighOrderReivew(this.works, this.index); }
			, isCancelButtonEnable() { return this.options.isCancelButtonEnable !== false; }
			, validationErrors() {
				if (this.$refs.form && this.$refs.form.errors)
					return this.$refs.form.errors;

				return [];
			}
			, orderedChildren() {
				return this.template.children ? this.template.children.reverse() : [];
			}
			, isHighOrderReivew() {
				return isHighOrderReivew(this.works, this.index);
			}
			, dynamicForm() {
				if (isHighOrderReivew(this.works, this.index)) {
					return this.schema.form.groups[1];
				} else {
					return this.schema.form.groups[0];
				}
			}
			, dynamicModel() {
				if (isHighOrderReivew(this.works, this.index)) {
					return this.model.highOrderReview;
				} else {
					return this.model.reviewOfWorks[this.index];
				}
			}
			, saveButtonCaption() {
				if (isHighOrderReivew(this.works, this.index)) {
					return this.schema.resources.saveCaption || _("Save");
				} else {
					return this.schema.resources.nextCaption || _("Next");
				}
			}
		}
		, watch: {
			schema(newSchema) {
				console.log("●", newSchema);
			}
			, template(newTemplate) {
				this.model = newTemplate;
			}
		}
		, methods: {
			select(e, work, index) {
				console.log(work, index);
				this.index = index;
			}
			, buttonSaveDidPush() {
				if (this.options.validateBeforeSave === false || this.validate()) {
					if (isHighOrderReivew(this.works, this.index)) {
						// save
						this.$emit("save", this.model.highOrderReview);
						this.index = 0;
					} else {
						// next
						const isEmpty = !this.schema.form.groups[0].fields.reduce((result, f) => {
							console.log(f.model, this.model.reviewOfWorks[this.index][f.model]);
							return result || this.model.reviewOfWorks[this.index][f.model];
						}, false);

						if (!isEmpty) {
							this.$emit("save", this.model.reviewOfWorks[this.index]);
						}
						this.index += 1;
					}
				} else {
					// Validation error
				}
			}
			, buttonSkipDidPush() {
				// TODO
			}
			, buttonCancelDidPush() { this.$emit("cancel"); }
			, validate() {
				let res = this.$refs.form.validate();

				if (this.schema.events && isFunction(this.schema.events.onValidated)) {
					this.schema.events.onValidated(
						this.model
						, this.$refs.form.errors
						, this.schema
					);
				}

				if (!res) {
					// Set focus to first input with error
					this.$nextTick(() => {
						let el = document.querySelector("div.form tr.error input:nth-child(1)");
						if (el) el.focus();
					});
				}
				return res;
			}
			// @see https://github.com/vue-generators/vue-form-generator/blob/master/src/formGenerator.vue#L316
			, closeVlidate(form, isAsync = null) {
				form.$children.forEach(child => {
					// notice: the required option not work without the validator option.
					if (child.schema.closeRequired) {
						child.schema._required = child.schema.required;
						child.schema.required = true;
					}
				});

				if (isAsync === null) {
					isAsync = objGet(form.options, "validateAsync", false);
				}
				form.clearValidationErrors();
				let fields = [];
				let results = [];
				form.$children.forEach(child => {
					if (isFunction(child.validate)) {
						fields.push(child); // keep track of validated children
						results.push(child.validate(true));
					}
				});
				let handleErrors = errors => {
					let formErrors = [];
					errors.forEach((err, i) => {
						if (isArray(err) && err.length > 0) {
							err.forEach(error => {
								formErrors.push({
									field: fields[i].schema
									, error: error
								});
							});
						}
					});
					form.errors = formErrors;
					let isValid = formErrors.length == 0;
					form.$emit("validated", isValid, formErrors);

					form.$children.forEach(child => {
						if (child.schema.closeRequired) {
							child.schema.required = child.schema._required;
						}
					});

					return isAsync ? formErrors : isValid;
				};

				if (!isAsync) { return handleErrors(results); }
				
				return Promise.all(results).then(handleErrors);
			}
			, getUser(code) {
				for (let i in this.users) {
					const user = this.users[i];
					if (user.code == code) {
						return user;
					}
				}
				return null;
			}
		}
		, created() {}
	};
</script>

<style lang="scss">	
	@import "../../../../scss/taschel/kanban";

	.kanban-item {
		border: 2px solid transparent;

		&.active {
			border: 2px solid yellow;
		}
	}

	.kanban-board {
		&-daily-works {
			border: 2px solid transparent;

			&.active {
				border: 2px solid yellow;
			}
		}
	}

	.popup-container {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999;

		$icon-font-path: "../../../../../node_modules/bootstrap-sass/assets/fonts/bootstrap/";	
		@import "../../../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/variables";
		@import "../../../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/mixins";
		@import "../../../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/glyphicons";
		@import "../../../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/type";
		@import "../../../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/dropdowns";
		@import "../../../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/input-groups";

		@import "../../../../../node_modules/eonasdan-bootstrap-datetimepicker/src/sass/bootstrap-datetimepicker-build";
		
		.bootstrap-datetimepicker-widget {
			color: #000;

			a {
				color: $link-color;
				text-decoration: none;
			}
		}
	}

	.popup {
		position: absolute;
		top: 150px;
		left: 100px;
		right: 100px;
		bottom: 0;
		margin: auto;
		transition: all 0.4s ease;
		font-size: 0.8em;

		.panel {
			background-color: rgba(16, 67, 87, 0.8);

			.body {
				overflow: visible;
			}
		}
	}
</style>