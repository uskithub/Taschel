<template lang="pug">
	v-app(id="inspire")
		drawer-menu(:isOpen="drawer", :items="items" @toggle-drawer="onToggleDrawer")
		page-header(:appTitle="appTitle" @click-side-icon="drawer = !drawer")
		v-content
			router-view(keep-alive)
</template>
<!-- template lang="pug">
	v-btn(
      fab
      bottom
      right
      color="pink"
      dark
      fixed
      @click="dialog = !dialog"
    )
      v-icon add
    v-dialog(v-model="dialog" width="800px")
      v-card
        v-card-title.grey.lighten-4.py-4.title Create contact
        v-container.pa-4(grid-list-sm)
          v-layout(row wrap)
            v-flex(xs12 align-center justify-space-between)
              v-layout(align-center)
                v-avatar.mr-3(size="40px")
                  img(
                    src="//ssl.gstatic.com/s2/oz/images/sge/grey_silhouette.png"
                    alt=""
                  )
                v-text-field(placeholder="Name")
            v-flex(xs6)
              v-text-field(
                prepend-icon="business"
                placeholder="Company"
              )
            v-flex(xs6)
              v-text-field(placeholder="Job title")
            v-flex(xs12)
              v-text-field(
                prepend-icon="mail"
                placeholder="Email"
              )
            v-flex(xs12)
              v-text-field(
                type="tel"
                prepend-icon="phone"
                placeholder="(000) 000 - 0000"
                mask="phone"
              )
            v-flex(xs12)
              v-text-field(
                prepend-icon="notes"
                placeholder="Notes"
              )
        v-card-actions
          v-btn(flat color="primary") More
          v-spacer
          v-btn(flat color="primary" @click="dialog = false") Cancel
          v-btn(flat @click="dialog = false") Save
</template -->

<script>
	import PageHeader from "./components/molecules/header";
	import DrawerMenu from "./components/molecules/drawer";
	export default {
		components: {
			PageHeader
			, DrawerMenu
		}
		, props: {
			source: String
		}
		, data: () => ({
			appTitle: "Taschel", 
			dialog: false,
			drawer: null,
			items: [
				{ icon: 'contacts', text: 'Contacts' },
				{ icon: 'history', text: 'Frequently contacted' },
				{ icon: 'content_copy', text: 'Duplicates' },
				{
					icon: 'keyboard_arrow_up',
					'icon-alt': 'keyboard_arrow_down',
					text: 'Labels',
					model: true,
					children: [
						{ icon: 'add', text: 'Create label' }
					]
				},
				{
					icon: 'keyboard_arrow_up',
					'icon-alt': 'keyboard_arrow_down',
					text: 'More',
					model: false,
					children: [
						{ text: 'Import' },
						{ text: 'Export' },
						{ text: 'Print' },
						{ text: 'Undo changes' },
						{ text: 'Other contacts' }
					]
				},
				{ icon: 'settings', text: 'Settings' },
				{ icon: 'chat_bubble', text: 'Send feedback' },
				{ icon: 'help', text: 'Help' },
				{ icon: 'phonelink', text: 'App downloads' },
				{ icon: 'keyboard', text: 'Go to the old version' }
			]
		})
		, methods: {
			onToggleDrawer(isOpen) {
				this.drawer = isOpen;
			}
		}
	}
</script>
