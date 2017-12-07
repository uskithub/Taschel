<template lang="pug">
    div(v-if="node != null")
        div
            div.border.up(:class="{'active': isDragging}"
                @drop="drop" 
                @dragenter="dragenter"
                @dragover="dragover"
                @dragleave="dragleave")

            div.tree-node(:id="node.code", :class="{'active': isDraggingIntoChild}"
                @dragstart="dragstart"
                @dragover="dragover"
                @dragenter="dragenter"
                @dragleave="dragLeave"
                @drop="drop"
                @dragend="dragend"
                @mouseover="mouseover"
                @mouseout="mouseout")
                span.caret.icon.is-small(v-if="node.children && node.children.length > 0")
                    i.vue-tree-icon(:class="caretClass" @click.prevent.stop="toggle")
                
                slot(name="treeNodeIcon")
                    i.vue-tree-icon.item-icon.icon-folder

                div.node-content {{node.name}}

                div.operation(v-show="isOpen")
                    span(title="add tree node")
                    slot(name="addTreeNode")
                        i.vue-tree-icon.icon-folder-plus-e

            div(v-if="node.children && node.children.length > 0", class="border bottom")

        div(:class="{'tree-margin': true}")
            item(v-for="child in node.children", :node="child" , :key='child.code')

</template>

<script>
    import $ from 'jquery';
    let _self = null;

    export default {
        data: function () {
            return {
                isHovering: false
                , isDroppable: false
                , isDraggingInsertBelow: false
                , isDraggingIntoChild: false
                , isOpen: true
            }
        } 
        , props: [
            "isRoot"
            , "node"
        ]
        , computed: {
            itemIconClass () {
                //return this.model.isLeaf ? 'icon-file' : 'icon-folder'
                return 'icon-folder'
            },
            caretClass () {
                return this.expanded ? 'icon-caret-down' : 'icon-caret-right'
            },
            isFolder() {
                return this.node.children && this.node.children.length > 0
            }
        }
        , mounted () {
            const vm = this
            $(window).on('keyup', function (e) {
                // click enter
                if (e.keyCode === 13 && vm.editable) {
                    vm.editable = false
                }
            })
        }
        , beforeDestroy () {
            $(window).off('keyup')
        }
        , methods: {
            dummy() {}
            // updateName (e) {
            //     this.node.changeName(e.target.value)
            // },
            // delNode () {
            //     const vm = this
            //     if (window.confirm('Are you sure?')) {
            //         vm.node.remove()
            //     }
            // },
            // setEditable () {
            //     this.editable = true
            //     this.$nextTick(() => {
            //         $(this.$refs.nodeInput).trigger('focus')
            //     })
            // },
            // setUnEditable () {
            //     this.editable = false
            // },
            , toggle() {
                this.isOpen = !this.isOpen;
            }
            , mouseover(e) {
                this.isHovering = true;
            }
            , mouseout(e) {
                this.isHovering = false;
            }
            // , addChild(isLeaf) {
            //     const name = 'hoge'
            //     this.expanded = true
            //     var node = new TreeNode(name, isLeaf)
            //     //this.model.addChildren(node, true)
            // }
            // ドラッグ開始
            , dragstart(e) {
                _self = this
                // for firefox
                e.dataTransfer.setData("data", "data");
                e.dataTransfer.effectAllowed = "move";
                return true;
            }
            , dragend(e) {
                _self = null;
            }
            // dragOver(e) {
            //     e.preventDefault()
            //     return true
            // },
            // dragEnter(e) {
            //     // if (this.model.isLeaf) {
            //     //     return
            //     // }
            //     this.isDragEnterNode = true
            // },
            // dragLeave(e) {
            //     this.isDragEnterNode = false
            // },
            // drop(e) {
            //     // fromComp.model.moveInto(this.model)
            //     this.isDragEnterNode = false
            // },
            // ドラッグしている要素がドロップ領域に入った
            , dragenter() {
                this.isDroppable = true;
            }
            // ドラッグしている要素がドロップ領域にある
            , dragover(e) {
                e.preventDefault();
                return true;
            }
            // ドラッグしている要素がドロップ領域から出たとき
            , dragleave () {
                this.isDroppable = false;
            }
            // ドラッグしている要素がドロップ領域にドロップされた
            , drop() {
                // fromComp.model.insertBefore(this.model)
                this.isDroppable = false;
            }
            // dragEnterBottom () {
            //     this.isDragEnterBottom = true
            // },
            // dragOverBottom (e) {
            //     e.preventDefault()
            //     return true
            // },
            // dragLeaveBottom () {
            //     this.isDragEnterBottom = false
            // },
            // dropBottom () {
            //     // fromComp.model.insertAfter(this.model)
            //     this.isDragEnterBottom = false
            // }
        },
        beforeCreate () {
            this.$options.components.item = require('./treeList.vue')
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
            background-color: transparent;
        }
        &.active {
            border-bottom: 3px dashed blue;
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
            background-color: #f0f0f0;
        }
        &.active {
            outline: 2px dashed pink;
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
        margin-left: 2em;
    }
</style>