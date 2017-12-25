<template lang="pug">
	.container
		h3.title {{ schema.title }}

		.flex.align-center.justify-space-around
			.left(v-if="isNewButtonEnable")
				button.button.is-primary(@click="buttonNewDidPush")
					i.icon.fa.fa-plus 
					| {{ schema.resources.addCaption || _("Add") }}
		br
		.form(v-if="projectSelector")
			vue-form-generator(:schema="projectSelector", :model="modelProjectSelector", ref="projectSelector", @model-updated="modelUpdated")

		kanban(:boards="groups", :tasks="tasks", @update-handler="arrange")

		popup-form(v-if="isEditing", :schema="schema.popupForm", :me="me", :selected="selected"
			, :save-model="saveModelWrapper"
			, :end-editing="endEditing"
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
		, props: [
			"schema"
			, "projects"
			, "groups"
			, "tasks"
			, "selectedProject"
		]
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
			, saveModel : {
				type: Function
			}
			, updateModel : {
				type: Function
			}
			, deleteModel : {
				type: Function
			}
		}

		, data() {
			return {
				order: {
					field: "id"
					, direction: 1
				}

				// 選択したプロジェクトが格納される
				, modelProjectSelector:  {
					code : this.selectedProject
				}
				, isEditingNewModel : false
            };
        }

		, computed: {
			...mapGetters("session", {
				search: "searchText"
			})

			, projectSelector() {
				if (this.schema.projectSelector) {
					this.schema.projectSelector.fields.forEach(f => {
						if (f.model == "code") {
							f.values = this.projects.map(project => {
								return {
									id : project.code
									, name : project.name
								}
							});
						}
					});	
					return this.schema.projectSelector;
				} else {
					return null;
				}
			}

			, options() { return this.schema.popupForm.options || {}; }
			, isNewButtonEnable() { return (this.options.isNewButtonEnable !== false); }
			, isEditing() { return this.isEditingNewModel; }
		}	

		, watch: {
			// propsで指定した名前に合わせる必要あり
			selectedTask() {
				console.log("●● selectedTask")
				// if (!this.isNewModel)
				// 	this.generateModel();
			}

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

			saveModelWrapper(model) {
				this.isEditingNewModel = false;
				this.saveModel(model);
			}
			, modelUpdated(newVal, schema) {
				console.log(`● ${schema}: ${newVal}`);
				if (newVal) {
					this.$parent.selectProject(newVal);
				} else {
					this.$parent.deselectProject();
				}
			}
			// TODO: ネーミング気になる。統一感がないのでどうにかする
            , arrange(context) {
				this.$parent.arrange(context);
            }

			, buttonNewDidPush() {
				console.log("Create new model...");

				this.isEditingNewModel = true;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			}
			, endEditing() {
				this.isEditingNewModel = false;
			}
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
			max-width: 400px;
			padding: 0.5em;
		}

	}
</style>
