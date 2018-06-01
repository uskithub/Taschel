<template lang="pug">
	input.tag-input(v-if="scope.edit" v-model="scope.tag.text" type="text" size="1", :maxlength="scope.maxlength"
		@input="scope.validateTag(scope.index)"
		@blur="scope.cancelEdit(scope.index)"
		@keydown.enter.prevent="scope.performSaveTag(scope.index)")
</template>

<script>
	export default {
		name: "TagInput"
		, props: [
			"scope"
		]
	};
</script>
