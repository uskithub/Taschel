import Layer from "./layer";

export default class Board {
	// TODO: groupsを生身で渡して、layersを取る時に new Layer()するべき？
	constructor(name, layers) { 
		this._name = name;
		this._layers = layers;
	}
	get name() { return this._name; }
	// F5 Reload時、[undefined]になるのでfilterする
	get layers() { return this._layers.filter(v => !!v); }
}