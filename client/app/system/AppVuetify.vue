<template lang="pug">
	v-app(id="inspire")
		drawer-menu(:isOpen="drawer", :items="items" @toggle-drawer="onToggleDrawer")
		page-header(:appTitle="appTitle" @click-side-icon="drawer = !drawer")
		v-content
			router-view(keep-alive)
</template>
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
			appTitle: "Taschel"
			, dialog: false
			, drawer: null
			, items: [
				{ icon: "home", text: "Home", href: "/" }
				, { icon: "home", text: "Projects", href: "/projects" }
				, { icon: "home", text: "WeeklyPlan", href: "/WeeklyPlan" }
				, { icon: "home", text: "WeeklyReview", href: "/weeklyReview" }
				, { icon: "home", text: "DailyLoop", href: "/dailyLoop" }
				, { icon: "home", text: "Kanban", href: "/kanban" }
				, { icon: "home", text: "Timeline", href: "/timeline" }
				, { icon: "home", text: "Gantt", href: "/gantt" }
				, { icon: "home", text: "Logout", href: "/logout" }

			]
		})
		, methods: {
			onToggleDrawer(isOpen) {
				this.drawer = isOpen;
			}
		}
	}
</script>
