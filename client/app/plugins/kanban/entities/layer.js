export default class Layer {
	constructor() { }
	get id() { throw new Error("Not Implemented! This method should return a value of String."); }
	get name() { throw new Error("Not Implemented! This method should return a value of String."); }
	get kanbans() { throw new Error("Not Implemented! This method should return an array of Kanban."); }
	get removable() { throw new Error("Not Implemented! This method should return a value of Boolean."); }
}