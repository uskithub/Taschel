<template lang="pug">
    div(v-if="node != null")
        .border.up(:class="{'active': isDraggingToGoUp}"
            @drop="dropAbove"
            @dragenter="dragenterAbove"
            @dragover="dragover"
            @dragleave="dragleaveAbove"
        )

        .media.gantt(:class="{'active': isDraggingIntoChild, 'milestone': node.type=='milestone', 'requirement': node.type=='requirement', 'way': node.type=='way', 'step': node.type=='step', 'todo': node.type=='todo'}")
            .tree-node(:id="node.code" draggable="!isRoot && isDraggable", :draggable="!isRoot && isDraggable"
                @click=""
                @dragstart="dragstart"
                @dragover="dragover"
                @dragenter=""
                @dragleave="dragleave"
                @drop="drop"
                @dragend="dragend"
                @mouseover="mouseover"
                @mouseout="mouseout"
            )
                .dummyHover
                span.icon-caret.icon.is-small(v-if="node.children && node.children.length > 0")
                    i.vue-tree-icon(:class="caretClass" @click.prevent.stop="toggle")
                
                slot(name="treeNodeIcon")
                    i.vue-tree-icon.item-icon.icon-folder

                //- div.node-content {{ `${node.name}(${node.code}) parent=${(node.parent instanceof Object) ? "obj" : node.parent}, children=[${(node.children) ? node.children.reduce((str, c) => { str += c.code + ", "; return str; }, "") : ""}]`}}
                .node-content {{ node.name }}

                .operation(v-show="isHovering")
                    span(v-if="add != undefined" title="add tree node" @click.prevent.stop="add($event, node)")
                        slot(name="addTreeNode")
                            i.vue-tree-icon.icon-folder-plus-e

            div(:class="{'tree-margin': true}", v-show="isOpen")
                tree-list(v-for="child in filteredOrderedNodes", :node="child", :isDraggable="isDraggable", :key='child.code', :add="add")

        .border.bottom(:class="{'active': isDraggingToGoDown}"
            @drop="dropBelow"
            @dragenter="dragenterBelow"
            @dragover="dragover"
            @dragleave="dragleaveBelow"
        )

</template>

<script>
    import toast from "../../toastr";

    import $ from 'jquery';
    let _self = null;

    export default {
        // name property is neccesary for recuriseve using.
        // @see https://vuejs.org/v2/api/#name
        name: "TreeList"
        , data: function () {
            return {
                isHovering: false
                , isDraggingToGoUp: false
                , isDraggingToGoDown: false
                , isDraggingIntoChild: false
                , isOpen: true
            }
        } 
        , components: {
        }
        , props: {
			isRoot: {
				type: Boolean
				, validator: function(value) { return true; } // TODO
            }
            , isReverse: {
                type: Boolean
                , default: false
				, validator: function(value) { return true; } // TODO
            }
            , isDraggable: {
                type: Boolean
                , default: true
				, validator: function(value) { return true; } // TODO
            }
			, node: {
				type: Object
				, required: true
				, validator: function(value) { return true; } // TODO
            }
            // this will be handed to child nodes recursively. So this is props not using $emit.
			, add: {
                type: Function
				, validator: function(value) { return true; } // TODO
			}
		}
        , computed: {
            itemIconClass () {
                //return this.model.isLeaf ? 'icon-file' : 'icon-folder'
                return "icon-folder";
            }
            , caretClass () {
                return this.isOpen ? "icon-caret-down" : "icon-caret-right";
            }
            , isFolder() {
                return this.node.children && this.node.children.length > 0
            }
            , filteredOrderedNodes() {
				let items = this.node.children;
				// if (this.search) {
				// 	let search = this.search.toLowerCase();
				// 	items = this.rows.filter(function (row) {
				// 		return searchInObject(row, search)
				// 	});
                // }
                
                return (items && this.isReverse) ? items.reverse() : items;
			}
        }
        , mounted () {}
        , beforeDestroy () {}
        , methods: {
            toggle(e) {
                this.isOpen = !this.isOpen;
            }
            , mouseover(e) {
                this.isHovering = true;
            }
            , mouseout(e) {
                this.isHovering = false;
            }

            // ドラッグ開始
            , dragstart(e) {
                _self = this;
                // for firefox
                e.dataTransfer.setData("data", "data");
                e.dataTransfer.effectAllowed = "move";
                return true;
            }
            , dragend(e) {
                _self = null;
            }

            // ドラッグしている要素がドロップ領域に入った
            , dragenterAbove(e) { 
                console.log("●来てるね");
                this.isDraggingToGoUp = true; 
            }
            , dragenter(e) { this.isDraggingIntoChild = true; }
            , dragenterBelow(e) { this.isDraggingToGoDown = true; }

            // ドラッグしている要素がドロップ領域にある
            , dragover(e) {
                e.preventDefault();
                return true;
            }
            
            // ドラッグしている要素がドロップ領域から出たとき
            , dragleaveAbove (e) { 
                console.log("●来てるね leave")
                this.isDraggingToGoUp = false; 
            }
            , dragleave (e) { this.isDraggingIntoChild = false; }
            , dragleaveBelow (e) { this.isDraggingToGoDown = false; }

            // obj1がobj2の子孫の場合、trueを返す
            , isDescendant(obj1, obj2) {
                if (obj1.parent == undefined) {
                    return false;
                } else {
                    if (obj1.parent.code == obj2.code) {
                        return true;
                    } else {
                        return this.isDescendant(obj1.parent, obj2);
                    }
                }
            }
            // obj1がobj2の子の場合、trueを返す
            , isParent(obj1, obj2) {
                if (obj1.parent == -1) {
                    toast.error(this._("Data不整合"), this._("parentが-1です"));
                    return true;
                }
                return (obj1.parent != undefined && obj1.parent.code == obj2.code);
            }

            // ドラッグしている要素がドロップ領域にドロップされた
            , dropAbove(e) {
                // - 子孫には移動不可
                // - rootより上には移動不可
                // - 自分の上には移動不可
                console.log(`● above ${ _self.node.name }, ${ this.node.name }`);
                this.isDraggingToGoUp = false;
                if (this.isRoot) return;
                
                if (this.node.parent == undefined) return;
                if (_self.node.code == this.node.code) return;
                let isDescendant = this.isDescendant(this.node, _self.node);
                if (isDescendant) return;

                this.$parent.arrange({
                    moving: _self.node
                    , target: this.node
                    , type: "above"});
            }
            , drop(e) {
                // - 子孫には移動不可
                // -  親には移動不可
                // -  自身には移動不可
                console.log(`● into ${ _self.node.name }, ${ this.node.name }`);

                this.isDraggingIntoChild = false;
                let isDescendant = this.isDescendant(this.node, _self.node);
                if (isDescendant) return;

                let isParent = this.isParent(_self.node, this.node);
                if (isParent) return;

                if (_self.node.code == this.node.code) return;

                this.$parent.arrange({
                    moving: _self.node
                    , target: this.node
                    , type: "into"});
            }
            , dropBelow(e) {
                // - 子孫には移動不可
                console.log(`● below ${ _self.node.name }, ${ this.node.name }`);
                this.isDraggingToGoDown = false;
                if (this.isRoot) return;

                this.$parent.arrange({
                    moving: _self.node
                    , target: this.node
                    , type: "below"});
            }
            // TreeListはVueComponentが再帰的に入れ子になっているので、最終的な読み出し元のindex.vueまで処理を上げていく
            , arrange(moveContext) {
                this.$parent.arrange(moveContext);
            }
        }
        , created() {
        }
    }
</script>

<style lang="scss" scoped>
    @import "../../../../scss/taschel/gantt";
    @include font-face("../../../../scss/taschel/");
</style>