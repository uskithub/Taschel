<template lang="pug">
    .container
        .flex.align-center.justify-space-around
            .left
                button.button.is-primary(@click="addTaskButtonDidPush")
                    i.icon.fa.fa-plus 
                    | {{ _("AddTask") }}
            .right
        data-table(:schema="tableSchema", :rows="tasks", :order="order", :selectedRows="[]" @select="$emit('select', $data)")
</template>

<script>
	import Vue from "vue";
    import AbstractView from "service/presentation/mixins/abstractView";
    
	// import Treenode from "../../plugins/gantt/treenode";
    // import Editing from "./editing";
    
    import { mapGetters } from "vuex";
    
	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
		, components : {
			// Editing
        }
        , props: {
			tableSchema : {
				type: Object
				, validator: function(value) { return true; } // TODO
				, required : true
            }
            , formSchema : {
				type: Object
				, validator: function(value) { return true; } // TODO
				, required : false
            }
        }
		, computed : {
			...mapGetters([
				"tasks"
				, "editingTaskTree"
			])
		}
		, data() {
			return {
				isEditing: false
				, order : {}
			};
		}
		, methods : {
			addTaskButtonDidPush() {
				this.isEditing = true;
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				// this.popCrumb();
				// this.$nextTick(() => {
				// 	this.entity = null;
				// 	this.taskTree = null;
				// });
			}
		}
	};
</script>