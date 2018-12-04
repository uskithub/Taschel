import Board from "./board";

export default class BoardGroup {
	// TODO: groupsを生身で渡して、boardsを取る時に new Board()するべき？
	constructor(name, boards) { 
		this._name = name;
		this._boards = boards;
	}
	get name() { return this._name; }
	// F5 Reload時、[undefined]になるのでfilterする
	get boards() { return this._boards.filter(v => !!v); }
}