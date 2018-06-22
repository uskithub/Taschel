<template lang="pug">
  .vue-gantt-header
    .gantt-row(v-for="(row, idx) in rows", :key="idx")
      .row-item(:title="obj.title" @click="$emit('header-click', obj)" v-for="(obj, idx) in row", :key="idx", :style="{ width: obj.width + 'px' }") {{ obj.label }}
</template>

<script>
export default {
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss">
	.vue-gantt-header {
		display: flex;
		flex-direction: column;
		width: 100%;
		flex-shrink: 0;
		border-top: 1px solid #ddd;
		border-right: 1px solid #ddd;

		.gantt-row {
			display: flex;
			flex-wrap: nowrap;
			justify-content: flex-start;
			height: 24px;

			&:last-child {
				border-bottom: 1px solid #ddd;
				.row-item {
					align-items: initial;
					height: 100vh;
				}
			}

			.row-item {
				box-sizing: border-box;
				flex-shrink: 0;
				display: flex;
				justify-content: center;
				align-items: center;

				border-bottom: 1px solid #ddd;
				border-right: 1px solid #ddd;
				overflow: hidden;
				text-overflow: ellipsis;
				cursor: pointer;

			}
		}
	}
	
</style>
