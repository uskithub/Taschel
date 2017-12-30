<template lang="pug">
    div
        div.border.up(:class="{'active': isDraggingToGoUp}"
            @drop="dropAbove"
            @dragenter="dragenterAbove"
            @dragover="dragover"
            @dragleave="dragleaveAbove")

        div.media(v-if="node != null", :class="{'media': node.type=='milestone', 'active': isDraggingIntoChild}")
            div.tree-node(:id="node.code" draggable="true"
                @click=""
                @dragstart="dragstart"
                @dragover="dragover"
                @dragenter="dragenter"
                @dragleave="dragleave"
                @drop="drop"
                @dragend="dragend"
                @mouseover="mouseover"
                @mouseout="mouseout")
                span.caret.icon.is-small(v-if="node.children && node.children.length > 0")
                    i.vue-tree-icon(:class="caretClass" @click.prevent.stop="toggle")
                
                slot(name="treeNodeIcon")
                    i.vue-tree-icon.item-icon.icon-folder

                //- div.node-content {{ `${node.name}(${node.code}) parent=${(node.parent instanceof Object) ? "obj" : node.parent}, children=[${(node.children) ? node.children.reduce((str, c) => { str += c.code + ", "; return str; }, "") : ""}]`}}
                div.node-content {{ node.name }}

                div.operation(v-show="isHovering")
                    span(v-if="add != undefined" title="add tree node" @click.prevent.stop="add($event, node)")
                        slot(name="addTreeNode")
                            i.vue-tree-icon.icon-folder-plus-e

            div(:class="{'tree-margin': true}", v-show="isOpen")
                tree-list(v-for="child in filteredOrderedNodes", :node="child", :key='child.code', :add="add")

        div(class="border bottom", :class="{'active': isDraggingToGoDown}"
            @drop="dropBelow"
            @dragenter="dragenterBelow"
            @dragover="dragover"
            @dragleave="dragleaveBelow")

</template>

<script>
    // TODO: この方法はどうも上手くいかない
    // import TreeList from "./treeList.vue";
    

    import toast from "../../toastr";

    import $ from 'jquery';
    let _self = null;

    export default {
        data: function () {
            return {
                isHovering: false
                , isDraggingToGoUp: false
                , isDraggingToGoDown: false
                , isDraggingIntoChild: false
                , isOpen: true
            }
        } 
        // TODO: この方法はどうも上手くいかない
        // , components: {
		// 	TreeList
        // }
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
                return this.isOpen ? ( this.isReverse ? "icon-caret-up" : "icon-caret-down" ) : "icon-caret-right";
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
            , dragenterAbove(e) { this.isDraggingToGoUp = true; }
            , dragenter(e) { this.isDraggingIntoChild = true; }
            , dragenterBelow(e) { this.isDraggingToGoDown = true; }

            // ドラッグしている要素がドロップ領域にある
            , dragover(e) {
                e.preventDefault();
                return true;
            }
            
            // ドラッグしている要素がドロップ領域から出たとき
            , dragleaveAbove (e) { this.isDraggingToGoUp = false; }
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
                // - 子孫にはい移動不可
                console.log(`● below ${ _self.node.name }, ${ this.node.name }`);
                this.isDraggingToGoDown = false;
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
        , beforeCreate () {
            this.$options.components.TreeList = require('./index.vue');
        }
        , created() {

        }
    }
</script>

<style lang="scss" scoped>
    @font-face {
        font-family: 'icomoon';
        src:  url('fonts/icomoon.eot?ui1hbx');
        src:  url('fonts/icomoon.eot?ui1hbx#iefix') format('embedded-opentype'),
        url('fonts/icomoon.ttf?ui1hbx') format('truetype'),
        url('fonts/icomoon.woff?ui1hbx') format('woff'),
        url('fonts/icomoon.svg?ui1hbx#icomoon') format('svg');
        font-weight: normal;
        font-style: normal;
    }
    .media {
        display: block;
        padding: 0.5em 0 0.5em 1em;

        &.active {
            outline: 2px dashed yellow;
        }
    }
    .vue-tree-icon {
        /* use !important to prevent issues with browser extensions that change fonts */
        font-family: 'icomoon' !important;
        speak: none;
        font-style: normal;
        font-weight: normal;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        /* Better Font Rendering =========== */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        &.item-icon {
            margin-right: 4px;
            &:hover {
                color: inherit;
            }
        }
        &:hover {
            color: blue;
        }
    }
    .icon-file:before {
        content: "\e906";
    }
    .icon-folder:before {
        content: "\e907";
    }
    .icon-caret-down:before {
        content: "\e900";
    }
    .icon-caret-up:before {
        content: "▲";
    }
    .icon-caret-right:before {
        content: "\e901";
    }
    .icon-edit:before {
        content: "\e902";
    }
    .icon-folder-plus-e:before {
        content: "\e903";
    }
    .icon-plus:before {
        content: "\e904";
    }
    .icon-trash:before {
        content: "\e905";
    }
    .border {
        height: 5px;
        &.up {
            margin-top: -5px;
            background-color: transparent;
        }
        &.bottom {
            // background-color: #c00;
        }
        &.active {
            border-bottom: 3px dashed yellow;
            /*background-color: blue;*/
        }
    }
    .tree-node {
        display: flex;
        align-items: center;
        padding: 5px 0 5px 1rem;
        .input {
            border: none;
            max-width: 150px;
            border-bottom: 1px solid blue;
        }
        &:hover {
            background-color: #C0C0C0;
        }
        .caret {
            margin-left: -1rem;
        }
        .operation {
            margin-left: 2rem;
            letter-spacing: 1px;
        }
    }
    .item {
        cursor: pointer;
    }
    .tree-margin {
        margin-left: 0.5em;
    }

    .work {
        background-color: rgba(0,0,0,0.5);
        border-radius: 2px;
        text-align: right;
    }
</style>