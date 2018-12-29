export default class Timeframe {
	constructor(treenode) {
		this._treenode = treenode;
		this._subtree = treenode.subtree.map(n => {
			console.log("%%%", n);
			return new Timeframe(n)
		});
	}

	get id() { return this._treenode.id; }
	get name() { return this._treenode.name; }
	get subtree() { return this._subtree; }
	
}