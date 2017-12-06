
// import を使うときはES6で書かないとダメらしい。
// @see https://stackoverflow.com/questions/36388766/unexpected-uncaught-typeerror-xxx-is-not-a-constructor-errors-with-babel-and

// こんなエラーが
// vue.common.js:525 TypeError: _treeList.Tree is not a constructor
// at VueComponent.data (DefaultGantPage.vue:35)


// import TreeList from "./treeList.vue";
// import { TreeNode, Tree, Record } from "./tree";

// exports = {
//     TreeList : TreeList
//     , TreeNode : TreeNode
//     , Tree : Tree
//     , Record : Record

// }

exports.VueTreeList = require('./treeList.vue')
exports.TreeNode = require('./tree.js').TreeNode
exports.Tree = require('./tree.js').Tree
exports.Record = require('./tree.js').Record