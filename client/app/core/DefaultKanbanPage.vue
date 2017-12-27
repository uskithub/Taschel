<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="isAddButtonEnable")
				button.button.is-primary(@click="buttonAddDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
		br
		.form
			vue-form-generator(:schema="schema.projectSelector", :model="modelProjectSelector", ref="projectSelector", @model-updated="selectProject")

		kanban(:boards="groups", :tasks="tasks", @arrange="arrange")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :template="model"
			, @save="save"
			, @remove="remove"
			, @cancel="cancel"
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

		components: {
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
			, projects : {
				type: Array
				, validator: function(value) { return true; } // TODO
			}
			, groups : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, tasks : {
				type: Array
				, required: true
				, validator: function(value) { return true; } // TODO
			}
			, selectedProject : {
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
				// 選択したプロジェクトが格納される
				, modelProjectSelector: {
					code : this.selectedProject
				}
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
			, isEditing() { return this.model != null; }
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
		},

		methods: {
			selectProject(newVal, schema) {
				console.log(`● ${schema}: ${newVal}`);
				this.$emit("select-project", newVal);
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
			, save(model) { this.$emit("save", this.model); }
			, remove() { this.$emit("remove"); }		// deleteは予約語なので怒られる
			, cancel() { this.$emit("cancel"); }
		}
		, created() {
		}	
				
	};

</script>

<style lang="scss">
    @import "../../scss/common/mixins";
    @import "../../scss/kanban.scss";

    $on-hold: #FB7D44;
    $in-progress: #2A92BF;
    $needs-review: #F4CE46;
    $approved: #00B961;

    * {
    	box-sizing: border-box;
    }

    body {
    	background: #33363D;
    	color: white;
    	font-family: 'Lato';
    	font-weight: 300;
    	line-height: 1.5;
    	-webkit-font-smoothing: antialiased;
    }

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
