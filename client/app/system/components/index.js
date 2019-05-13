import DataTable from "./organisms/table";
import TimeLine from "./organisms/treebasedtimeline";
import Fullcalendar from "./organisms/fullcalendar";

const plugin = {
	// @see https://jp.vuejs.org/v2/guide/plugins.html
	install (Vue, options) {
		console.log("★★★ install system components ★★★");
		
		const finalOptions = Object.assign({}, options);

		// lifecycleの追加
		// const strategies = Vue.config.optionMergeStrategies;
		// strategies.googleMapsAPIsLoaded = strategies.created;

		// componentの追加
		Vue.component("data-table", DataTable);
		Vue.component("time-line", TimeLine);
		Vue.component("fullcalendar", Fullcalendar);

		// maps.googleapiのロード
		// if (finalOptions.load) {
		// 	loader.load(finalOptions.load)
		// 		.then(() => {
		// 			console.log("★★★ GoogleMapsAPI loaded!! ★★★");
		// 			// インスタンスにGoogleMapsAPI用のプロパティを追加
		// 			Vue.prototype.$googlemapsapi = {
		// 				geocoder: new window.google.maps.Geocoder()
		// 				// , placeService: new window.google.maps.places.PlacesService(this.$refs.attributions)
		// 			};
		// 		});
		// }
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