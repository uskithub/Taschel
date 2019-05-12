<template lang="pug">
	.container
		.flex.align-center.justify-space-around
			.left
				button.button.is-primary(@click="$emit('add')")
					i.icon.fa.fa-plus {{ _("AddTask") }}
			.right
		data-table(:schema="schema", :rows="tasks", :order="order", :selectedRows="[]" @select="selectButtonDidPush")
</template>

<script>
	import Vue from "vue";
    import AbstractView from "service/presentation/mixins/abstractView";
    
    import { mapGetters } from "vuex";
    
	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
		, components : {
			// Editing
        }
        , props: {
			schema : {
				type: Object
				, validator: function(value) { return true; } // TODO
				, required : true
            }
        }
		, computed : {
			...mapGetters([
				"tasks"
			])
		}
		, data() {
			return {
				order : {}
			};
		}
		, methods : { 
			selectButtonDidPush(entity) {
				this.$emit("select", entity);
			}
		}
	};
</script>