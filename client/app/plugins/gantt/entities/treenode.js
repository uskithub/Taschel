export default class Treenode {
	constructor() { }
	get id() { throw new Error("Not Implemented! This method should return a value of String."); }
	get name() { throw new Error("Not Implemented! This method should return a value of String."); }
	get styleClass() { throw new Error("Not Implemented! This method should return a value of String."); }    
	get content() { throw new Error("Not Implemented! This method should return an instance of the domain model."); }
	get subtrees() { throw new Error("Not Implemented! This method should return an array of Treenode."); }
}