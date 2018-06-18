import board from "./components/board";
import kanban from "./components/kanban";

const plugin = {
    install (Vue, options) {
		console.log("★★★ install VueKanban plugin ★★★");
		
		const finalOptions = Object.assign({}, options);

		// componentの追加
		Vue.component("Board", board);
		Vue.component("Kanban", kanban);
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