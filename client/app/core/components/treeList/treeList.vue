<template lang="pug">
    div(v-if="node != null")
        div
            div.border.up

            div.tree-node(:id='node.code')
                span.caret.icon.is-small(v-if="node.children && node.children.length > 0")
                    i.vue-tree-icon(:class="caretClass")
                
                slot(name="treeNodeIcon")
                    i.vue-tree-icon.item-icon.icon-folder

                div.node-content {{node.name}}

            div(v-if="node.children && node.children.length > 0", class="border bottom")

        div(:class="{'tree-margin': true}")
            item(v-for="child in node.children", :node="child" , :key='child.code')

</template>

<script>
    import { Tree, TreeNode } from './tree.js'
    import $ from 'jquery'
    let fromComp = ''

    export default {
        // data: function () {
        //     return {
        //         isHover: false,
        //         editable: false,
        //         isDragEnterUp: false,
        //         isDragEnterBottom: false,
        //         isDragEnterNode: false,
        //         expanded: true
        //     }
        // }
        
        //, 
        props: [
            "isRoot"
            , "node"
        ]


        // props: {
        //     model: {
        //         type: Object
        //     },
        //     defaultLeafNodeName: {
        //         type: String,
        //         default: 'New leaf node'
        //     },
        //     defaultTreeNodeName: {
        //         type: String,
        //         default: 'New tree node'
        //     }
        // },
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
        },
        mounted () {
            const vm = this
            $(window).on('keyup', function (e) {
                // click enter
                if (e.keyCode === 13 && vm.editable) {
                    vm.editable = false
                }
            })
        },
        beforeDestroy () {
            $(window).off('keyup')
        },
        methods: {
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
            // toggle() {
            //     if (this.isFolder) {
            //         this.expanded = !this.expanded
            //     }
            // },
            // mouseOver(e) {
            //     // this.isHover = true
            // },
            // mouseOut(e) {
            //     // this.isHover = false
            // },
            // addChild(isLeaf) {
            //     const name = 'hoge'
            //     this.expanded = true
            //     var node = new TreeNode(name, isLeaf)
            //     //this.model.addChildren(node, true)
            // },
            // dragStart(e) {
            //     fromComp = this
            //     // for firefox
            //     e.dataTransfer.setData("data","data");
            //     e.dataTransfer.effectAllowed = 'move'
            //     return true
            // },
            // dragEnd(e) {
            //     fromComp = null
            // },
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
            // dragEnterUp () {
            //     this.isDragEnterUp = true
            // },
            // dragOverUp (e) {
            //     e.preventDefault()
            //     return true
            // },
            // dragLeaveUp () {
            //     this.isDragEnterUp = false
            // },
            // dropUp () {
            //     // fromComp.model.insertBefore(this.model)
            //     this.isDragEnterUp = false
            // },
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