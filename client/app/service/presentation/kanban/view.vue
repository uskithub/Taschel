<template lang="pug">
	kanban-board(:boards="[currentProjectKanbanBoard]" @arrange="")
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
			}
			, entity : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
        }
		, computed : {
			...mapGetters([
				"currentProjectKanbanBoard"
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
<style lang="scss" scoped></style>