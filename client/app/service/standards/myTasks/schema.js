import Vue from "vue";

const _ = Vue.prototype._;

export default {
	table: {
		multiSelect : true
		, columns : [ "properties", "name", "purpose", "goal", "author", "lastCommunication"]
		, rowClasses : function (model) {
			return {
				// inactive: !model.status
			};
		}
	}
	, form : { 
		fields : [ "properties", "name", "purpose", "goal"]
	}
};