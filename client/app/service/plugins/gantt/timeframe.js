export default class Timeframe {
	constructor(treenode) {
		this._task = treenode.task;
	}

	get id() { return this._task.code; }
	get name() { return this._task.name; }

	static timeframeRowsFactory(treenodes) {
		let _makeTimeframeRowsRecursively = (treenodes, arr = []) => {
			return treenodes.reduce( (arr, treenode) => {
				arr.push(new Timeframe(treenode));
				if ((treenode.subtree !== null || treenode.subtree !== undefined) && treenode.subtree.length > 0) {
					arr = _makeTimeframeRowsRecursively(treenode.subtree, arr);
				}
				return arr;
			}, arr);
		};
		let ret = _makeTimeframeRowsRecursively(treenodes);
		console.log("******", ret);
		return ret;
	}
	
}