<template lang="pug">
	h1 {{ title }}
</template>
<script>
export default {
	name: "Test"
	, props : {
		title : {
			type: String
			, default: "ほげ"
		}
	}
}
</script>
