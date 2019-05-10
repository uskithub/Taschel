<script>
	import Vue from "vue";
	import { mapGetters } from "vuex";

	const _ = Vue.prototype._;

	export default {
		computed : {
			...mapGetters([
				"isReady"
				, "me"
				// , "currentProject"
				// , "currentWeek"
				// , "currentWeekOfMonth"
				// , "currentUserId"
			])
		}
		, data() {
			return { }
		}
		, methods : { }
		, created() { }
	};
</script>
<style lang="scss">
	.no-scroll {
		overflow: hidden;
	}
</style>