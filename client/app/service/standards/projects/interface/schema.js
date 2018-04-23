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
	, form : (() => {
		let _form = generate(
			componentTypes.form
			, ["name", "shortname", "purpose", "goal", "description"]
		);
		console.log(_form);
		return { 
			fields : _form.fields.map( f => {
				if (f.model == "type") {
					f.type = "input";
					f.inputType = "text";
					f.default = "project";
					f.readonly = true;
					f.disabled = true;
				}
				return f;
			})
		};
	})()
};