<script>
	import Vue from "vue";

	import { cloneDeep, isObject, isArray } from "lodash";
	import moment from "moment";

	import { mapGetters, mapActions } from "vuex";
	import { COMMON } from "service/application/mutationTypes";
    import { サービスの利用を開始する } from "service/application/usecases";

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
			return {
				popup: null
			}
		}
		, methods : {
			...mapActions({
				サービスの利用を開始する
				// , "getUserProjectList"
			})
			, ...mapActions([
				// for Presentation
				"setWayBackOnLastCrumb"
				, "setSelectorOnLastCrumb"
				, "pushCrumb"
				, "popCrumb"
			])
		}
		, created() {

			if (this.isReady) {
				console.log(this.$options.name, "is created. Required states are ready.");

				const impls = this.$options.sessionEnsured;
				if (impls) {
					if (isArray(impls)) {
						impls.forEach(impl => {
							impl.call(this, this.me);
						});
					} else {
						impls.call(this, this.me);
					}
				}
			} else {
				console.log(this.$options.name, "is created. Required states are not ready.");
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				// （meはApp.vue で getCurrentSession() して作られる）
				this.$store.subscribe((mutation, state) => {
					if (mutation.type === COMMON.GET_READY) {
						console.log("Observed getting ready for required states.");

						const me = state.session.user;
						const impls = this.$options.sessionEnsured;
						if (me && impls) {
							if (isArray(impls)) {
								impls.forEach(impl => {
									impl.call(this, me);
								});
							} else {
								impls.call(this, me);
							}
						}
					}
				});

				// Get ready for required states.
				this.サービスの利用を開始する()
				// .then(this.getUserProjectList)
				.then(_ => {
					// poised
					this.$store.commit(COMMON.GET_READY);
				});
			}
		}
		, sessionEnsured(me) {
			console.warn("[sessionEnsured] plz override me at mixed in components.", me);
		}
	};
</script>
<style lang="scss">
	.no-scroll {
		overflow: hidden;
	}
</style>