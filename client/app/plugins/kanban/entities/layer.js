export default class Layer {
	constructor() { }
	get id() { throw new Error("Not Implemented! This method should return a value of String."); }
	get name() { throw new Error("Not Implemented! This method should return a value of String."); }
	get kanbans() { throw new Error("Not Implemented! This method should return an array of Kanban."); }
	// kanbanを外す✕ボタンを表示するか否か（性質上、backlogなlayerは他から外したkanbanが戻ってくる場所であって、外すことはできない）
	get removable() { throw new Error("Not Implemented! This method should return a value of Boolean."); }
}