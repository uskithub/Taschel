<template lang="pug">
	.container
		v-toolbar(dark color="pink")
			v-btn(icon)
				v-icon more_vert
			v-toolbar-title My Music
			v-spacer
			v-btn(icon)
				v-icon search
		v-card
			v-container(fluid grid-list-lg)
				data-table(:schema="schema", :rows="tasks", :order="order", :selectedRows="[entity]" @select="selectButtonDidPush")
</template>

<script>
	import Vue from "vue";
    import AbstractView from "system/mixins/abstractView";
    
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
<style lang="scss" scoped>
	.footer {
		position: relative;
		height: 50px;
	}
</style>