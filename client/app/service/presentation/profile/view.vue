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
		div
			.flex.align-center.justify-space-around
				.left
					button.button.is-primary(@click="onJoinOrganization")
						i.icon.fa.fa-plus 
						| {{ _("JoinOrganization") }}
			data-table(:schema="schema.table", :rows="organizations", :order="order", :selectedRows="[]" @select="onSelect")
</template>

<script>
	import Vue from "vue";
    import AbstractView from "system/mixins/abstractView";
    
	import DataTable from "system/components/organisms/table";
	import schema from "./schema";
    import { mapGetters } from "vuex";
    
	const _ = Vue.prototype._;

	export default {
		mixins : [ AbstractView ]
		, components : {
			DataTable
		}
		, computed: {
			...mapGetters([
				"profile"
				, "organizations"
			])
			, sessionUserProfile() {
				return this.profile || {};
			}
		}
		, data() {
			return {
				isEditing: false
				, schema
				, order : {}
				, options : {}
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
			enableCalendar() {
				// this.updateProfile({ model: this.profile, mutation: "UPDATE" });
			}
			, onJoinOrganization() {
				this.isEditing = true;
			}
			, onSelect(event, entity) {
				this.editOrganization(entity);
				this.isEditing = true;
			}
			, onSave(newEntity) {
				// TODO
				this.createOrganization({ entity : newEntity, mutation : ADD })
			}
			, onClose() {
				this.isEditing = false;
				this.$nextTick(() => {
					this.finishEditingOrganization();
				});
			}
		}
	};

</script>

<style lang="scss" scoped>

	// @import "../../../../scss/themes/blurred/variables";
	// @import "../../../../scss/common/mixins";

	.container {
		padding: 1rem;
	}

	.profile {
		position: relative;
		// $avatarSize: 6em;
		
		.avatar {
			// width: $avatarSize;
			// height: $avatarSize;
			// border-radius: $avatarSize / 2;
			margin: 0.8em 2em 0 0;
			
		} // .avatar
		
		.details {
			// margin-bottom: 1em;
			
			.name {
				font-weight: 300;
				font-size: 2.5em;
				line-height: 1.3em;
				// font-family: $fontFamilyHeader;

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
						// color: $textColor;
						font-weight: 400;
					}
					
				} // .info-row
				
			} // .description
			
		} // .details

	} // .profile

</style>