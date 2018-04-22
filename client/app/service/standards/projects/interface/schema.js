import Vue from "vue";
import moment from "moment";
import { validators } from "vue-form-generator";
import { componentTypes, generate } from "../../../fundamentals/fieldGenerator";

import { find } from "lodash";

const _ = Vue.prototype._;

module.exports = {
	table: {
		multiSelect : false
		, columns : generate(
			componentTypes.table
			, [ "shortname", "name", "purpose", "goal"]
		)
		, rowClasses : function (model) {
			return {
				// inactive: !model.status
			};
		}
	}
};