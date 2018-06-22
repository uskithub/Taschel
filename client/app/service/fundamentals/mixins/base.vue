<script>
	import Vue from "vue";
	import Popup from "../components/popup";

	import { cloneDeep, isObject, isArray } from "lodash";
	import moment from "moment";

	import { mapGetters, mapActions } from "vuex";
	import { SET_USER } from "../../fundamentals/mutationTypes";

	const _ = Vue.prototype._;
	const VuePopup = Vue.extend(Popup);

	export default {
		computed : {
			...mapGetters([
				"me"
				, "currentProject"
				, "currentWeek"
				, "currentUserId"
			])
		}
		, data() {
			return {
				isSessionReady: false
				, popup: null
			}
		}
		, methods : {
			...mapActions([
				// for Presentation
				"setWayBackOnLastCrumb"
				, "setSelectorOnLastCrumb"
				, "pushCrumb"
				, "popCrumb"
			])
			, showPopup(propsData) {
				// @see http://kitak.hatenablog.jp/entry/2017/04/04/044829
				let popup = new VuePopup({ propsData: propsData }).$mount();
				popup.$on("close", e => {
					this.didClosePopup(e);
				});
				this.$el.appendChild(popup.$el);
				this.popup = popup;
			}
			, didClosePopup(e) {
				if (this.popup) {
					this.$el.removeChild(this.popup.$el);
					this.popup.$destroy();
					this.popup = null;
				}
			}
		}
		, created() {
			if (this.$options.name) {
				this.pushCrumb({ id: this._uid, name: this.$options.name });
			}

			if (this.me) {
				this.isSessionReady = true;
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
				this.isSessionReady = false;
				// F5リロード時など、meがundefinedの場合があるので、その場合、meの更新を監視してtaskを更新する
				this.$store.subscribe((mutation, state) => {
					if (mutation.type === SET_USER) {
						this.isSessionReady = true;
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