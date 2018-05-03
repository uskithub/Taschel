<template lang="pug">
	.container
		.profile.flex.row.align-stretch
			img.avatar(:src="sessionUserProfile.avatar")
			
			.details.flex-item-1
				.name {{ sessionUserProfile.fullName }}
					span.text-muted.username ({{ sessionUserProfile.username }})
				.tags
					.tag.primary !Role name!
					.tag.danger !Administrator!
					.tag.success !Online!
				.description
					.info-row(v-if="sessionUserProfile.profile && sessionUserProfile.profile.location")
						i.fa.fa-map-marker
						span.caption Location:
						span.value {{ sessionUserProfile.profile.location }}
					.info-row
						i.fa.fa-clock-o
						span.caption Last login:
						span.value !Online!
					.info-row
						i.fa.fa-calendar
						span.caption Joined:
						span.value {{ sessionUserProfile.createdAt | ago }}
				hr.full
		button.button.primary(@click="enableCalendar") Enable Calendar
		editing(v-if="isEditing", :target="currentOrganization", :schema="schema" @save="onSave" @close="onClose")
		div(v-else)
			.flex.align-center.justify-space-around
				.left
					button.button.is-primary(@click="onJoinOrganization")
						i.icon.fa.fa-plus 
						| {{ _("JoinOrganization") }}
			data-table(:schema="schema.table", :rows="schema.table.stab", :order="order", :selectedRows="[]" @select="onSelect")
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import DataTable from "../../fundamentals/components/table";
	import Editing from "./editing"
	import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;

	export default {
		mixins : [ Base ]
		, components : {
			DataTable
			, Editing
		}
		, computed: {
			...mapGetters("environment/session/profile", {
				sessionUserProfile : "profile"
			})
			, ...mapGetters("environment/session/organization", {
				organizations : "organizations"
			})
		}
		, data() {
			return {
				isEditing: false
				, schema
				, order : {}
				, options: {}
			};
		}
		, watch : {
			sessionUserProfile(newProfile) {
				if (newProfile.googleAuthUrl) {
					window.location.href = newProfile.googleAuthUrl;
				}
			}
 		}
		, methods: {
			...mapActions("environment/session/profile", {
				// DDD: Domain Service
				// Name actions in accordance with their use-cases.
				getSessionUserProfile : "getProfile"
			})
			, ...mapActions("environment/session/organization", {
				// DDD: Domain Service
				// Name actions in accordance with their use-cases.
				getOrganizationList : "getOrganizationList"
			})
			, enableCalendar() {
				// this.updateProfile({ model: this.profile, mutation: "UPDATE" });
			}
			, onJoinOrganization() {
				this.isEditing = true;
			}
			, onSelect() {
				// TODO
			}
			, onSave() {
				// TODO
			}
			, onClose() {
				// TODO
			}
		}
		, sessionEnsured(me) {
			// Get my profile
			this.getSessionUserProfile({ options: { userCode: me.code } });
			this.getOrganizationList({ options: { userCode: me.code } }); 
		}
	};

</script>

<style lang="scss" scoped>

	@import "../../../../scss/themes/blurred/variables";
	@import "../../../../scss/common/mixins";

	.container {
		padding: 1rem;
	}

	.profile {
		position: relative;
		$avatarSize: 6em;
		
		.avatar {
			width: $avatarSize;
			height: $avatarSize;
			border-radius: $avatarSize / 2;
			margin: 0.8em 2em 0 0;
			
		} // .avatar
		
		.details {
			// margin-bottom: 1em;
			
			.name {
				font-weight: 300;
				font-size: 2.5em;
				line-height: 1.3em;
				font-family: $fontFamilyHeader;

				.username {
					font-size: 0.7em;
					margin-left: 0.3em;
				}

			} // .name
			
			.tags {
				font-size: 1.1em; 
			}

			.description {
				margin-top: 0.6em;
				line-height: 1.3em;
				font-size: 0.9em;
				
				.info-row {
					font-size: 0.9em;
					line-height: 1.3em;
					
					i {
						width: 1.5em;
					}
					
					.caption {
						display: inline-block;
						width: 5em;
					}
					
					.value {
						margin-left: 0.5em;
						color: $textColor;
						font-weight: 400;
					}
					
				} // .info-row
				
			} // .description
			
		} // .details

	} // .profile

</style>