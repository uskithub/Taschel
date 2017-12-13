<template lang="pug">
	div.drag-container
		ul.drag-list
			li(v-for="stage in stages" class="drag-column", :class="{['drag-column-' + stage]: true}", :key="stage")
				span.drag-column-header
					h2 {{ stage }}
				div.drag-options
				ul.drag-inner-list(ref="list", :data-status="stage")
					li.drag-item(v-for="block in getBlocks(stage)", :data-block-id="block.id", :key="block.id")
						slot(:name="block.id")
							strong {{ block.status }}
							div {{ block.id }}
</template>

<script>
	import dragula from 'dragula';

	export default {
		props: {
			stages: {}
			, blocks: {}
		}

		, data() {
			return {

			};
		}
		, computed: {
			localBlocks() {
				return this.blocks;
			}
		}
		
		, methods: {
			getBlocks(status) {
				return this.localBlocks.filter(block => block.status === status);
			}
		}

		, mounted() {
			dragula(this.$refs.list)
				.on('drag', (el) => {
					el.classList.add('is-moving');
				})
				.on('drop', (block, list) => {
					let index = 0;
					for (index = 0; index < list.children.length; index += 1) {
						if (list.children[index].classList.contains('is-moving')) break;
					}
					this.$emit('update-block', block.dataset.blockId, list.dataset.status, index);
				})
				.on('dragend', (el) => {
					el.classList.remove('is-moving');
					window.setTimeout(() => {
					el.classList.add('is-moved');
					window.setTimeout(() => {
						el.classList.remove('is-moved');
					}, 600);
				}, 100);
			});
		}
	};
</script>
