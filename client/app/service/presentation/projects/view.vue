<!-- // DDD: Presentation -->
<template lang="pug">
    .container
        .flex.align-center.justify-space-around
            .left
                button.button.is-primary(@click="$emit('add')")
                    i.icon.fa.fa-plus 
                    | {{ _("AddProject") }}
            .right
        data-table(:schema="schema", :rows="projects", :order="order", :selectedRows="[entity]" @select="selectButtonDidPush")
</template> 
<script>
	import Vue from "vue";
	import AbstractView from "service/presentation/mixins/abstractView";
	
	import { mapGetters } from "vuex";

	const _ = Vue.prototype._;
	
	export default {
		mixins : [ AbstractView ]
        , props: {
			schema : {
				type: Object
				, validator: function(value) { return true; } // TODO
				, required : true
			}
			, entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
        }
		, computed : {
			...mapGetters([
				"projects"
			])
		}
		, data() {
			return {
				order: {}
			};
		}
		, methods : {
			selectButtonDidPush(entity) {
				this.$emit("select", entity);
			}
		}
	};
</script>
<style lang="scss" scoped></style>