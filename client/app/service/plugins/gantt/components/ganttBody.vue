 <template lang="pug">
  .vue-gantt-body
    .task(v-for="(task, idx) in tasks", :key="idx")
      .interval(v-for="({ display, desc, color, width, offset, from, to }, idx) in task", :key="idx" v-show="display", :style="{'background-color': color,  width: width + 'px', 'margin-left': offset + 'px'}", :title="`${desc}, 'From' ${from} 'to' ${to}`") {{ desc }}
</template>

<script>
export default {
  props: {
    tasks: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss">
	.vue-gantt-body {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		flex-shrink: 0;
		overflow: hidden;
		
		.task {
			display: flex;
			flex-wrap: nowrap;
			align-items: center;
			line-height: 2.5em;
			height: 2.5em;
			flex-shrink: 0;
			overflow: hidden;
			border-bottom: 1px solid #ddd;

			.interval {
				text-align: center;
				box-sizing: border-box;
				overflow: hidden;
				text-overflow: ellipsis;
				min-width: 8px;
				height: 3em;
			}
		}
	}
</style>
