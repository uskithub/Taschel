<script>
	import Vue from "vue";
	
	import { cloneDeep, isObject, isArray } from "lodash";
	import moment from "moment";

	import { mapGetters, mapActions } from "vuex";
	import { SET_USER } from "../../fundamentals/mutationTypes";

	const _ = Vue.prototype._;

	export default {
		computed : {
			...mapGetters([
				"me"
				, "currentProject"
				, "currentWeek"
				, "currentUserId"
			])
		}
		, methods : {
			...mapActions([
				// for Presentation
				"setWayBackOnLastCrumb"
				, "setSelectorOnLastCrumb"
				, "pushCrumb"
				, "popCrumb"
			])
		}
		, created() {
			if (this.$options.name) {
				this.pushCrumb({ id: this._uid, name: this.$options.name });
			}

			if (this.me) {
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
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				this.$store.subscribe((mutation, state) => {
					if (mutation.type === SET_USER) {
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
			}
		}
		, sessionEnsured(me) {
			console.log("[sessionEnsured] plz override me at mixed in components.", me);
		}
	};
</script>