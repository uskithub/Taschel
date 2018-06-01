<template lang="pug">
	.vue-tags-input(:class="{ disabled }")
		.form-control
			ul.tags(v-if="tagsCopy")
				li.tag(v-for="(tag, index) in tagsCopy", :tabindex="index + 1", :key="index", :style="tag.style", :class="[tag.tiClasses, tag.classes, { 'deletion-mark': isMarked(index) }]"
					@click="$emit('tag-clicked', { tag, index })"
				)
					.content
						.tag-left(v-if="$scopedSlots.tagLeft")
							slot(name="tagLeft"
								, :tag="tag"
								, :index="index"
								, :edit="tagsEditStatus[index]"
								, :perform-save-edit="performSaveTag"
								, :perform-delete="performDeleteTag"
								, :perform-cancel-edit="cancelEdit"
								, :perform-open-edit="performEditTag"
								, :deletion-mark="isMarked(index)")
						.tag-center(ref="tagCenter")
							.span(v-if="!$scopedSlots.tagCenter" @click="performEditTag(index)", :class="{ hidden: tagsEditStatus[index] }") {{ tag.name }}
							tag-input(v-if="!$scopedSlots.tagCenter", :scope="{ edit: tagsEditStatus[index], maxlength, tag, index, validateTag: createChangedTag, cancelEdit, performSaveTag }")
							slot.tag-center-slot(name="tagCenter"
								, :tag="tag"
								, :index="index"
								, :maxlength="maxlength"
								, :edit="tagsEditStatus[index]"
								, :perform-save-edit="performSaveTag"
								, :perform-delete="performDeleteTag"
								, :perform-cancel-edit="cancelEdit"
								, :validate-tag="createChangedTag"
								, :cancel-edit="cancelEdit"
								, :perform-save-tag="performSaveTag"
								, :perform-open-edit="performEditTag"
								, :deletion-mark="isMarked(index)")
						.tag-right(v-if="$scopedSlots.tagRight")
							slot(name="tagRight"
								, :tag="tag"
								, :index="index"
								, :edit="tagsEditStatus[index]"
								, :perform-save-edit="performSaveTag"
								, :perform-delete="performDeleteTag"
								, :perform-cancel-edit="cancelEdit"
								, :perform-open-edit="performEditTag"
								, :deletion-mark="isMarked(index)")
					.actions
						i.icon-undo(v-if="!$scopedSlots.tagActions" v-show="tagsEditStatus[index]" @click="cancelEdit(index)")
						i.icon-close(v-if="!$scopedSlots.tagActions" v-show="!tagsEditStatus[index]" @click="performDeleteTag(index)")
						slot(v-if="$scopedSlots.tagActions" name="tagActions"
							, :tag="tag"
							, :index="index"
							, :edit="tagsEditStatus[index]"
							, :perform-save-edit="performSaveTag"
							, :perform-delete="performDeleteTag"
							, :perform-cancel-edit="cancelEdit"
							, :perform-open-edit="performEditTag"
							, :deletion-mark="isMarked(index)"
						)
				li.new-tag-input-wrapper
					input.new-tag-input(v-bind="$attrs" v-model="newTag" type="text" size="1" ref="newTagInput"
						, :class="[createClasses(newTag, value, validation, false)]"
						, :placeholder="placeholder"
						, :maxlength="maxlength"
						@paste="addTagsFromPaste"
						@keydown.enter.prevent="performAddTags( filteredAutocompleteItems[selectedItem] || newTag )"
						@keydown.8="invokeDelete"
						@keydown.38="selectItem($event, 'before')"
						@keydown.40="selectItem($event, 'after')"
						@input="updateNewTag"
						@blur="$emit('blur', $event)"
						@focus="focused = true; $emit('focus', $event)"
						@click="addOnlyFromAutocomplete ? false: selectedItem = null"
					)
		.slot(name="between-elements")
		.autocomplete(v-if="autocompleteOpen" @mouseout="selectedItem = null")
			ul
				li.item(v-for="(item, index) in filteredAutocompleteItems", :key="index", :style="item.style", :class="[ item.tiClasses, item.classes, { 'selected-item': isSelected(index) } ]" @mouseover="disabled ? false : selectedItem = index")
					div(v-if="!$scopedSlots.autocompleteItem" @click="performAddTags(item)") {{ item.name }}
					slot(v-else name="autocompleteItem", :item="item", :index="index", :perform-add="performAddTags", :selected="isSelected(index)")
</template>

<script>
	import { createTag, createClasses } from "./create-tags";
	import TagInput from "./tag-input";
	import { clone } from "lodash";

	const propValidatorTag = value => {
		return !value.some(t => {
			const invalidText = !t.name;
			if (invalidText) console.warn("Missing property \"name\"", t);

			let invalidClasses = false;
			if (t.classes) invalidClasses = typeof t.classes !== "string";
			if (invalidClasses) console.warn("Property \"classes\" must be type of string", t);

			return invalidText || invalidClasses;
		});
	};

	export default {
		name: "VueTagsInput"
		, components: {
			TagInput
		}
		, props: {
			value: {
				type: Array
				, default: () => []
				// validator(value) { return propValidatorTag(value); }
			}
			, autocompleteItems: {
				type: Array
				, default: () => []
				// validator(value) { return propValidatorTag(value); }
			}
			, allowEditTags: {
				type: Boolean
				, default: false
			}
			, autocompleteFilterDuplicates: {
				default: true
				, type: Boolean
			}
			, addOnlyFromAutocomplete: {
				type: Boolean
				, default: false
			}
			, autocompleteMinLength: {
				type: Number
				, default: 1
			}
			, autocompleteAlwaysOpen: {
				type: Boolean
				, default: false
			}
			, disabled: {
				type: Boolean
				, default: false
			}
			, placeholder: {
				type: String
				, default: "タグを選択して下さい"
			}
			, maxTags: {
				type: Number
			}
			, maxlength: {
				type: Number
			}
			, validation: {
				type: Array
				, default: () => []
				, validator(value) {
					return !value.some(v => {
						const missingRule = !v.rule;
						if (missingRule) console.warn("Property \"rule\" is missing", v);

						const validRule = v.rule && (
							typeof v.rule === "string" ||
							v.rule instanceof RegExp ||
							{}.toString.call(v.rule) === "[object Function]"
						);

						if (!validRule) {
							console.warn(
								"A rule must be type of string, RegExp or function. Found:",
								JSON.stringify(v.rule)
							);
						}

						const missingType = !v.type;
						if (missingType) console.warn("Property \"type\" is missing", v);

						const invalidType = v.type && typeof v.type !== "string";
						if (invalidType) console.warn("Property \"type\" must be type of string. Found:", v);

						return !validRule || missingRule || missingType || invalidType;
					});
				}
			}
			, separators: {
				type: Array
				, default: () => [";"]
				, validator(value) {
					return !value.some(s => {
						const invalidType = typeof s !== "string";
						if (invalidType) console.warn("Separators must be type of string. Found:", s);
						return invalidType;
					});
				}
			}
			, avoidAddingDuplicates: {
				type: Boolean
				, default: true
			}
			, addOnBlur: {
				type: Boolean
				, default: true
			}
			, addFromPaste: {
				type: Boolean
				, default: true
			}
			, deleteOnBackslash: {
				default: true
				, type: Boolean
			}
		}
		, data() {
			return {
				createClasses
				, newTag: ""
				, tagsCopy: null
				, tagsEditStatus: null
				, deletionMark: null
				, deletionMarkTime: null
				, selectedItem: null
				, focused: null
				, filteringWord: null
			};
		}
		, computed: {
			autocompleteOpen() {
				if (this.autocompleteAlwaysOpen && this.focused) return true;
				return this.newTag !== null
					&& this.newTag.length >= this.autocompleteMinLength
					&& this.filteredAutocompleteItems.length > 0 
					&& this.focused;
			}
			, filteredAutocompleteItems() {
				const items = this.autocompleteItems.map(i => {
					return createTag(i, this.value, this.validation, false);
				});
				if (!this.autocompleteFilterDuplicates) return items;

				if (this.filteringWord) {
					return items.filter(i => !this.tagsCopy.find(t => t.id === i.id))
						.filter(i => i.name.indexOf(this.filteringWord) === 0);
				} else {
					return items.filter(i => !this.tagsCopy.find(t => t.id === i.id));
				}
			}
		}
		, methods: {
			getSelectedIndex(methods) {
				const items = this.filteredAutocompleteItems;
				if (items.length === 0) return;
				if (this.selectedItem === null) return 0;
				let index = 0;
				if (methods === "before" && this.selectedItem === 0) index = items.length - 1;
				else if (methods === "after" && this.selectedItem === items.length - 1) index = 0;
				else methods === "after" ? index = this.selectedItem + 1 : index = this.selectedItem - 1;
				return index;
			},
			selectDefaultItem() {
				if (this.addOnlyFromAutocomplete && this.filteredAutocompleteItems.length > 0) {
					this.selectedItem = 0;
				} else this.selectedItem = null;
			},
			selectItem(e, method) {
				e.preventDefault();
				this.selectedItem = this.getSelectedIndex(method);
			},
			isSelected(index) {
				return this.selectedItem === index;
			},
			isMarked(index) {
				return this.deletionMark === index;
			},
			invokeDelete() {
				if (!this.deleteOnBackslash || (this.newTag && this.newTag.length > 0)) return;
				const lastIndex = this.tagsCopy.length - 1;
				if (this.deletionMark === null) {
					this.deletionMarkTime = setTimeout(() => this.deletionMark = null, 1000);
					this.deletionMark = lastIndex;
				} else this.performDeleteTag(lastIndex);
			},
			addTagsFromPaste() {
				if (!this.addFromPaste) return;
				setTimeout(() => this.performAddTags(this.newTag), 10);
			},
			performEditTag(index) {
				if (!this.allowEditTags) return;
				if (!this._events["before-editing-tag"]) this.editTag(index);
				this.$emit("before-editing-tag", {
					index,
					tag: this.tagsCopy[index],
					editTag: () => this.editTag(index),
				});
			},
			editTag(index) {
				if (!this.allowEditTags) return;
				this.toggleEdit(index);
				this.focus(index);
			},
			toggleEdit(index) {
				if (!this.allowEditTags || this.disabled) return;
				this.$set(this.tagsEditStatus, index, !this.tagsEditStatus[index]);
			},
			clone(items) {
				return JSON.parse(JSON.stringify(items));
			},
			createChangedTag(index) {
				const tags = this.tagsCopy;
				this.$set(this.tagsCopy, index, createTag(tags[index], tags, this.validation));
			},
			focus(index) {
				this.$nextTick(() => {
					const el = this.$refs.tagCenter[index].querySelector("input.tag-input");
					if (el) el.focus();
				});
			},
			quote(regex) {
				return regex.replace(/([()[{*+.$^\\|?])/g, "\\$1");
			},
			cancelEdit(index) {
				this.tagsCopy[index] = Object.assign({},
					createTag(this.value[index], this.value, this.validation)
				);
				this.$set(this.tagsEditStatus, index, false);
			},
			hasForbiddingAddRule(tiClasses) {
				return tiClasses.some(type => {
					const rule = this.validation.find(rule => type === rule.type);
					return rule ? rule.disableAdd : false;
				});
			},
			createTagTexts(string) {
				const regex = new RegExp(this.separators.map(s => this.quote(s)).join("|"));
				return string.split(regex).map(name => {
					return { name };
				});
			},
			performDeleteTag(index) {
				if (!this._events["before-deleting-tag"]) this.deleteTag(index);
				this.$emit("before-deleting-tag", {
					index,
					tag: this.tagsCopy[index],
					deleteTag: () => this.deleteTag(index),
				});
			},
			deleteTag(index) {
				if (this.disabled) return;
				this.deletionMark = null;
				clearTimeout(this.deletionMarkTime);
				this.value.splice(index, 1);
				this.tagsCopy.splice(index, 1);
				this.$emit("tags-changed", this.tagsCopy);
			},
			performAddTags(tag) {
				if (tag == null) return;
				if (this.disabled) return;
				if (typeof tag === "string" && tag.trim().length === 0) return;
				let tags = [];
				if (typeof tag === "object") tags = [tag];
				if (typeof tag === "string") tags = this.createTagTexts(tag);
				tags.forEach(tag => {
					if (!this._events["before-adding-tag"]) this.addTag(tag);
					this.$emit("before-adding-tag", {
						tag,
						addTag: () => this.addTag(tag),
					});
				});
				this.filteringWord = null;
				this.newTag = "";
			},
			addTag(tag) {
				const options = this.filteredAutocompleteItems.map(i => i.name);
				if (this.addOnlyFromAutocomplete && options.indexOf(tag.name) === -1) return;
				const maximumReached = this.maxTags && this.maxTags === this.tagsCopy.length;
				if (maximumReached) return this.$emit("max-tags-reached");
				const dup = this.avoidAddingDuplicates &&
					this.tagsCopy.map(t => t.name).indexOf(tag.name) !== -1;
				if (dup) return this.$emit("adding-duplicate", tag);
				if (!tag.valid && this.hasForbiddingAddRule(tag.tiClasses)) return;
				this.tagsCopy.push(tag);
				this.$emit("input", this.tagsCopy.map(t => t.id));
				this.$emit("tags-changed", this.tagsCopy);
			},
			performSaveTag(index) {
				const tag = this.tagsCopy[index];
				if (this.disabled) return;
				if (tag.name.trim().length === 0) return;
				if (!this._events["before-saving-tag"]) this.saveTag(index, tag);
				this.$emit("before-saving-tag", {
					index,
					tag,
					saveTag: () => this.saveTag(index, tag),
				});
			},
			saveTag(index, tag) {
				const dup = this.avoidAddingDuplicates &&
					this.tagsCopy.filter(t => t.name === tag.name).length > 1;
				if (dup) return this.$emit("saving-duplicate", tag);
				if (!tag.valid && this.hasForbiddingAddRule(tag.tiClasses)) return;
				this.$set(this.tagsCopy, index, tag);
				this.toggleEdit(index);
				this.$emit("tags-changed", this.tagsCopy);
			},
			updateNewTag(ievent) {
				const value = ievent.target.value;
				this.filteringWord = value;
			},
			initTags() {
				this.tagsCopy = this.value.reduce((arr, id) => {
					let tag = this.autocompleteItems.find(item => item.id === id);
					if (tag) {
						const t = clone(tag);
						t.tiClasses = createClasses(t.name, this.autocompleteItems, this.validation);
						arr.push(t);
					}
					return arr;
				}, []);
				this.tagsEditStatus = this.clone(this.value).map(() => false);
			},
			blurred(e) {
				// if the click occur on tagsinput -> dont hide
				if (this.$el.contains(e.target)) return;

				// if we should add tags before blur -> add tag
				if (this.addOnBlur && this.focused) this.performAddTags(this.newTag);

				// hide tagsinput
				this.focused = false;
			}
		}
		, watch: {
			value: {
				handler(newValue) {
					this.initTags();
				},
				deep: true,
			}
			, autocompleteOpen() {
				this.selectDefaultItem();
			}
		}
		, created() {
			this.initTags();
		}
		, mounted() {
			this.selectDefaultItem();
			document.addEventListener("click", this.blurred);
		}
		, destroyed() {
			document.removeEventListener("click", this.blurred);
		}
	};
</script>

<style lang="scss" scoped>
	$primary: #5C6BC0;
	$error: #e54d42;
	$success: #68cd86;
	$warn: #ffb648;

	@font-face {
		font-family: "icomoon";
		src:  url("./assets/fonts/icomoon.eot?7grlse");
		src:  url("./assets/fonts/icomoon.eot?7grlse#iefix") format("embedded-opentype"),
			url("./assets/fonts/icomoon.ttf?7grlse") format("truetype"),
			url("./assets/fonts/icomoon.woff?7grlse") format("woff");
		font-weight: normal;
		font-style: normal;
	}

	[class^="icon-"], [class*=" icon-"] {
		font-family: "icomoon" !important;
		speak: none;
		font-style: normal;
		font-weight: normal;
		font-variant: normal;
		text-transform: none;
		line-height: 1;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.icon-check:before {
		content: "\e902";
	}
	.icon-close:before {
		content: "\e901";
	}
	.icon-undo:before {
		content: "\e900";
	}

	ul {
		margin: 0px;
		padding: 0px;
		list-style-type: none;
	}

	*, *:before, *:after {
		box-sizing: border-box;
	}

	.vue-tags-input {
		position: relative;
	}

	.vue-tags-input.vue-tags-input.disabled {
		opacity: 0.5;

		* {
			cursor: default;
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
	}

	.tag {
		background-color: $primary;
		color: #fff;
		border-radius: 2px;
		border: none;
		display: flex;
		padding: 3px 5px;
		margin: 2px;
		font-size: .85em;

		&:focus {
			outline: none;
		}

		.content {
			display: flex;
			align-items: center;
		}

		.tag-center {
			position: relative;
		}

		span.hidden {
			padding-left: 18px;
			visibility: hidden;
			height: 0px;
			white-space: pre;
		}

		.actions {
			margin-left: 2px;
			display: flex;
			align-items: center;
			font-size: 1.15em;

			i {
				cursor: pointer;
			}
		}

		&:last-child {
			margin-right: 4px;
		}

		&.invalid, &.tag.deletion-mark {
			background-color: $error;
		}
	}

	.new-tag-input-wrapper {
		display: flex;
		flex: 1 0 auto;
		padding: 3px 5px;
		margin: 2px;
		font-size: .85em;

		input {
			flex: 1 0 auto;
			min-width: 100px;
			border: none;
			padding: 0px;
			margin: 0px;
			background-color: transparent;
		}
	}

	.autocomplete {
		border: 1px solid #ccc;
		border-top: none;
		position: absolute;
		width: 100%;
		background-color: #fff;
		z-index: 20;
	}

	.item {
		> div {
			cursor: pointer;
			padding: 3px 6px;
			width: 100%;
		}
	}

	.selected-item {
		background-color: $primary;
		color: #fff;
	}
	</style>

	<style lang="scss">
	.vue-tags-input .tag-center {
		.tag-input {
			background-color: transparent;
			color: inherit;
			border: none;
			padding: 0px;
			margin: 0px;
			display: flex;
			top: 0px;
			position: absolute;
			width: 100%;
		}

		.tag-input::-ms-clear {
			display: none;
		}
	}

</style>
