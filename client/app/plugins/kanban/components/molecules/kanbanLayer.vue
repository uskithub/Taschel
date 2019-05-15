<template lang="pug">
    li.layer
        span.layer-header
            legend {{ _(layer.name) }}
        .drag-options
        ul.kanban-list(data-type="layer", :data-id="layer.id"
            @dragenter="onDragenter($event, layer)"
        )
            kanban.top-level-item(v-for="kanban in layer.kanbans", :parent="layer", :kanban="kanban", :key="kanban.id", :isDisplayTag="true", :removable="removable"
                @dragstart="onDragstart"
                @dragend="onDragend"
                @dragenter="onDragenter"
                @remove="onRemove"
            )
</template>
<script>
    import Vue from "vue";
	import Kanban from "../atoms/kanban";

    const _ = Vue.prototype._;

	export default {
		components : {
			Kanban
		}
        , props: {
			layer : {
				type: Object
                , validator: (value) => { return true; } // TODO
                , required: true
            }
            // kanbanを外す✕ボタンを表示するか否か（性質上、backlogなlayerは他から外したkanbanが戻ってくる場所であって、外すことはできない）
            , removable : {
                type: Boolean
                , validator: (value) => { return true; } // TODO
                , default: true
            }
		}
		, methods : {
            onDragstart(e, parent, kanban) {
                this.$emit('dragstart', e, parent, kanban);
                e.stopPropagation();
			}
			, onDragend(e, kanban) {
				this.$emit("dragend", e, kanban);
				e.stopPropagation();
			}
			, onDragenter(e, layer) {
				this.$emit("dragenter", e, layer);
				e.stopPropagation();
			}
			, onRemove(e, parent, kanban) {
                this.$emit("remove", e, parent, kanban);
                e.stopPropagation();
			}
        }
	};

</script>

<style lang="scss">
	@import "../assets/style";
</style>