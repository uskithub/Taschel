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
		br
		.form
			vue-form-generator(:schema="schema.projectSelector", :model="modelProjectSelector" ref="projectSelector" @model-updated="selectProject")

		kanban-board(:boardGroups="boardGroups", @arrange="arrange" @select="select")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			, @save="save"
			, @remove="remove"
			, @cancel="cancel"
		)
</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import KanbanBoard from "./components/kanban";
	import PopupForm from "./components/popupform";

	import { each, find, cloneDeep, isFunction, debounce } from "lodash";

	import { mapGetters, mapActions } from "vuex";

	export default {

		name: "KanbanPage"
        , components: {
			KanbanBoard
			, PopupForm
		}

        // task-page(:schema="schema", :selectedTasks="selectedTasks", :projects="projects", :tasks="tasks", :users="users") に対応させる
		, props: {
			schema : {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, projects : {
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
				// 選択したプロジェクトが格納される
				, modelProjectSelector: {
					code : this.selectedProject
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
			, isAddButtonEnable() { return this.options.isAddButtonEnable !== false && this.selectedProject != null; }
			, isEditing() { return this.model != null || this.selectedTasks.length > 0; }
		}	
		, watch: {
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
			, selectProject(newVal, schema) { this.$emit("select-project", newVal); }
			, arrange(context) { this.$emit("arrange", context); }
			, buttonAddDidPush() {
				this.$emit("add");

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}
			, select(task) { this.$emit("select-kanban", task); }
			, save(model) { this.$emit("save", model); }
			, remove() { this.$emit("remove"); }		// deleteは予約語なので怒られる
			, cancel() { this.$emit("cancel"); }
		}
		, created() {
		}
	};

</script>

<style lang="scss" scoped>
	@import "../../scss/common/mixins";

    $on-hold: #FB7D44;
    $in-progress: #2A92BF;
    $needs-review: #F4CE46;
    $approved: #00B961;

    .drag-column {
        &-on-hold {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $on-hold;
            }
        }

        &-in-progress {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $in-progress;
            }
        }

        &-needs-review {
            .drag-column-header,
            .is-moved,
            .drag-options{
                background: $needs-review;
            }
        }

        &-approved {
            .drag-column-header,
            .is-moved,
            .drag-options {
                background: $approved;
            }
        }
	}
	
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
