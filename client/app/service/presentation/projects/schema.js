import Vue from "vue";

const _ = Vue.prototype._;

module.exports = {
	table: {
		multiSelect : false
		, columns : [ "shortname", "name", "purpose", "goal"]
		, rowClasses : function (model) {
			return {
				// inactive: !model.status
			};
		}
	}
	, form : { 
		fields : [ "projectType", "name", "shortname", "purpose", "goal", "description"]
	}
};