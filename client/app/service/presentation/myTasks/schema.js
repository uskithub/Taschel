import Vue from "vue";

const _ = Vue.prototype._;

export default {
	table: {
		multiSelect : true
		, columns : [ "type", "name", "purpose", "goal", "author", "lastCommunication"]
		, rowClasses : function (model) {
			return {
				// inactive: !model.status
			};
		}
	}
	, form : { 
		fields : [ "type", "name", "purpose", "goal"]
	}
};