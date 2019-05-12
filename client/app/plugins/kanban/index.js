import Kanban from "./components/atoms/kanban";
import Board from "./components/organisms/board";

const plugin = {
	install (Vue, options) {
		console.log("★★★ install VueKanban plugin ★★★");
		
		const finalOptions = Object.assign({}, options);

		// componentの追加
		Vue.component("kanban", Kanban);
		Vue.component("board", Board);
	}
};

export default plugin;

// Auto-install
let GlobalVue = null;

if (typeof window !== "undefined") {
	GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
	GlobalVue = global.Vue;
}

if (GlobalVue) {
	GlobalVue.use(plugin);
}