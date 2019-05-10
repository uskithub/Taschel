<template lang="pug">
	profile-view
</template>
<script>
	import Vue from "vue";
    import AbstractPresenter from "service/presentation/mixins/abstractPresenter";
    import ProfileView from "./view"

	import schema from "./schema";
	import { mapMutations, mapActions } from "vuex";

	import { 
		プロフィールを取得する
		, 所属組織一覧を取得する
	} from "service/application/usecases";

    const _ = Vue.prototype._;

	export default {
		name : "Home"
		, mixins : [ AbstractPresenter ]
		, components : {
			ProfileView
		}
		, computed: { }
		, data() {
			return { };
		}
		, watch : { }
		, methods: {
			...mapActions({
				プロフィールを取得する
				, 所属組織一覧を取得する
			})
			, enableCalendar() {
				// this.updateProfile({ model: this.profile, mutation: "UPDATE" });
			}
			, onJoinOrganization() {
				this.isEditing = true;
			}
			, onSelect(event, entity) {
				// this.editOrganization(entity);
				this.isEditing = true;
			}
			, onSave(newEntity) {
				// TODO
				// this.createOrganization({ entity : newEntity, mutation : ADD })
			}
			, onClose() {
				this.isEditing = false;
				this.$nextTick(() => {
					// this.finishEditingOrganization();
				});
			}
		}
		, sessionEnsured(me) {
			// Get my profile
			this.プロフィールを取得する();
			this.所属組織一覧を取得する(); 
		}
	};

</script>
