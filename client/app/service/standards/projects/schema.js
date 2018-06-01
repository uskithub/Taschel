import Vue from "vue";
import moment from "moment";
import { validators } from "vue-form-generator";

import { find } from "lodash";

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