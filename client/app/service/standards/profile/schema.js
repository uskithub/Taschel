import Vue from "vue";
import moment from "moment";
import { validators } from "vue-form-generator";
import { componentTypes, generate } from "../../fundamentals/fieldGenerator";

import { find } from "lodash";

const _ = Vue.prototype._;

export default {
	table: {
		multiSelect : true
		, columns : generate(
			componentTypes.table
			, [ "organizationName", "organizationType", "role" ]
		)
		, rowClasses : function (model) {
			return {
				// inactive: !model.status
			};
		}
		, stab : [
			{ organizationName : "JIBUNSTYLE", organizationType : "enterprize", role : "admin" }
			, { organizationName : "折詰め会", organizationType : "normal", role : "member" }
		]
	}
	, form : {
		fields : generate(
			componentTypes.form
			, [ "organizationName", "organizationType" ]
		)
	}
};