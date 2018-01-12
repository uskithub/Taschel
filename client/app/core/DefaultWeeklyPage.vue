<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.content(v-if="isShowTips && schema.descriptions && schema.descriptions.length > 0")
			.media.primary
				.media-content
					strong このページの概要
					p
						ul
							li(v-for="line in schema.descriptions") {{ line }}
				.media-right
					a.close(title="Close" @click="off")
			br

		.flex.align-center.justify-space-around
			.left(v-if="isAddButtonEnable")
				button.button.is-primary(@click="buttonAddDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
			.center
				.form
					vue-form-generator(:schema="schema.userSelector", :model="modelUserSelector" ref="userSelector" @model-updated="selectUser")
		
			.right(v-if="currentWeek")
				button.button.is-primary(@click="buttonPrevDidPush")
					i.icon.fa.fa-arrow-left
				.tag.primary {{ currentWeek }}
				button.button.is-primary(@click="buttonNextDidPush")
					i.icon.fa.fa-arrow-right
		br
		kanban(:boardGroups="boardGroups", @arrange="arrange" @select="select")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			@save="save"
			@close="close"
			@clone="clone"
			@breakdown="breakdown"
			@remove="remove"
			@cancel="cancel"
		)
</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import Kanban from "./components/kanban";
	import PopupForm from "./components/popupform";

	import { each, find, cloneDeep, isFunction, debounce } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {
		name: "WeeklyPage"
        , components: {
			Kanban
			, PopupForm
		}
        // task-page(:schema="schema", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :users="users") に対応させる
		, props: {
			schema : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, currentWeek : {
				type: String
				, validator: function(value) { return true; } // TODO
			}
			, projects : {
				type: Array
				, validator: function(value) { return true; } // TODO
			}
			, users : {
				type: Array
				, validator: function(value) { return true; } // TODO
			}
			, boardGroups : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, selectedProject : {
				type: String 
			}
			, selectedTasks : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, currentUser : {
				type: String 
			}
			, model : {
				type: Object
				, validator: function(value) { return true; } // TODO
			}
		}
		, data() {
			return {
				order: {
					field: "id"
					, direction: 1
				}
				// 選択したユーザが格納される
				, modelUserSelector: {
					author : this.currentUser
				}
				, isShowTips : true
            };
        }
		, computed: {
			...mapGetters("session", {
				search: "searchText"
			})
			, options() { 
				if (this.schema.popupForm) {
					return this.schema.popupForm.options || {}; 
				} else {
					return {};
				}
			}
			, isAddButtonEnable() { return this.options.isAddButtonEnable !== false; }
			, isEditing() { return this.model != null || this.selectedTasks.length > 0; }
		}	
		, watch: {
			currentUser(newVal) {
				this.modelUserSelector.author = newVal;
			}
			/*
			model: {
				handler: function(newVal, oldVal) {
					if (newVal === oldVal) // call only if a property changed, not the model
						console.log("Model property changed!");
				},
				deep: true
			}*/
		}
		, methods: {
			off() { this.isShowTips = false; }
            , selectUser(newVal, schema) { 
				// if (newVal !== undefined) {
					// When user reloaded the page by F5, model-update would be called with undefined.
					// Otherwise user selected nothing-selected, model-update would be called with null.
					this.$emit("selectUser", newVal);
				// }
			}
			, arrange(context) { this.$emit("arrange", context); }
			, buttonAddDidPush() {
				this.$emit("add");

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}
			, buttonPrevDidPush() { this.$emit("changeWeek", "prev"); }
			, buttonNextDidPush() { this.$emit("changeWeek", "next"); }
			, select(task) { this.$emit("select-kanban", task); }
			, save(model) { this.$emit("save", model); }
			, close(model) { this.$emit("close", model); }
			, clone() { this.$emit("clone"); }
			, breakdown() { this.$emit("breakdown"); }
			, remove() { this.$emit("remove"); }		// deleteは予約語なので怒られる
			, cancel() { this.$emit("cancel"); }
		}
		, created() {
		}
	};

</script>

<style lang="scss" scoped>
	@import "../../scss/common/mixins";
	@import "../../scss/taschel/kanban";

 	.section {
    	padding: 20px;
    	text-align: center;

    	a {
    		color: white;
    		text-decoration: none;
    		font-weight: 300;
    	}

    	h4 {
    		font-weight: 400;
    		a {
    			font-weight: 600;
    		}
    	}
    }

	.container {
		padding: 1rem;
	}

	.form {
		margin: 1rem 0;

		@include bgTranslucentDark(0.2);
		border-radius: 8px;

		.buttons {
			padding: 0.5em;
		}

	}
</style>
