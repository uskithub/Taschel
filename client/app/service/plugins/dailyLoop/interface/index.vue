<template lang="pug">
	section
		h1 hoge
		fullcalendar(:events="events", :options="options", :currentWeek="currentWeek")
</template>

<script>
	
	export default {
		data() {
			return {
				events: []
				, options: {}
				, currentWeek : "2018-04-10"
			};
		}
	};
</script>

<style lang="scss" scoped>
</style>