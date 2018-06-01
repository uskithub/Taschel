import Vue from "vue";
import moment from "moment";
import { validators } from "vue-form-generator";
import { componentTypes, generate } from "../../fundamentals/fieldGenerator";

import { find } from "lodash";

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