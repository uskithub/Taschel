<template lang="pug">
  
</template>
<script>
	import Vue from "vue";
	import Base from "../../../fundamentals/mixins/base";
	import schema from "./schema";
	import { mapGetters, mapMutations, mapActions } from "vuex";
	import { LOAD_TASKS, SELECT_TASK, SET_WAY_BACK, POP_CRUMB } from "../../../fundamentals/mutationTypes";
	const _ = Vue.prototype._;

	export default {
		mixins : [ Base ]
		, props : {
			target : {
				type: Object
				, validator: (value) => { return true; } // TODO
			}
		}
		, methods : {
			...mapMutations("session", {
				setWayBack : SET_WAY_BACK
				, popCrumb : POP_CRUMB
			})
		}
		, created() {
			this.setWayBack(() => { 
				this.$emit("close"); 
				this.popCrumb();
			});
			this.pushCrumb({ id: this._uid, name: this.target.name });
		}
	}
</script>
<style lang="sass" scoped>

</style>

