<template lang="pug">
	aside.nav(:class="{ mini: minimized }")
		.menu
			.title {{ "General" | i18n }}
			ul
				router-link(tag="li", to="/")
					a(:title="_('Home')")
						span.icon
							i.fa.fa-home
						span.label {{ "Home" | i18n }}

				router-link(tag="li", to="/weekly")
					a(:title="_('Weekly')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Weekly" | i18n }}

				router-link(tag="li", to="/daily")
					a(:title="_('Daily')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Daily" | i18n }}

				router-link(tag="li", to="/daily-review")
					a(:title="_('Daily Review')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Daily Review" | i18n }}
				
				router-link(tag="li", to="/projects")
					a(:title="_('Projects')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Projects" | i18n }}

				router-link(tag="li", to="/tasks")
					a(:title="_('Tasks')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Tasks" | i18n }}

				router-link(tag="li", to="/kanban")
					a(:title="_('Kanban')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Kanban" | i18n }}

				router-link(tag="li", to="/gantt")
					a(:title="_('Gantt')")
						span.icon
							i.fa.fa-tasks
						span.label {{ "Gantt" | i18n }}

			.title {{ "Profile" | i18n }}
			ul
				li
					a(href="/logout", :title="_('Logout')")
						span.icon
							i.fa.fa-sign-out
						span.label {{ "Logout" | i18n }}

		.footer
			.social
				a(href="", target="_blank")
					i.fa.fa-facebook
				a(href="https://twitter.com/Icebobcsi", target="_blank")
					i.fa.fa-twitter
				a(href="https://github.com/icebob/vue-express-mongo-boilerplate", target="_blank")
					i.fa.fa-github
			.copyright &copy; Copyright, 2016
</template>

<script>

	export default {
		name: "Sidebar"
        , props: [
			"minimized"
		]
	};
	
</script>

<style lang="scss">
</style>