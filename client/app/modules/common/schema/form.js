import Vue from "vue";
import moment from "moment";
import { taskTypes } from "../../../common/types";
import { validators } from "vue-form-generator";

let _ = Vue.prototype._;

const fields = {
	code: {
		type: "text",
		label: _("ID"),
		model: "code",
		readonly: true,
		disabled: true,
		multi: false,
		get(model) {
			if (model.code)
				return model.code;
			else
				return _("※自動採番");
		}
	}
	, root_code: {
		type: "select"
		, label: _("Projects")
		, model: "root_code"
		, values: []
		, default: ""
	}
	, type: {
		type: "select",
		label: _("TaskType"),
		model: "type",
		required: true,
		values: taskTypes,
		default: "step",
		validator: validators.required
	}
	, name: {
		type: "text",
		label: _("名称"),
		model: "name",
		featured: true,
		required: true,
		placeholder: _("タスクの名称（何をするかが連想できる様に）"),
		validator: validators.string
	}
	, purpose: {
		type: "text",
		label: _("目的"),
		model: "purpose",
		placeholder: _("なぜそのタスクをするのか"),
		featured: false,
		required: true,
		validator: validators.string
	}
	, goal: {
		type: "text",
		label: _("ゴール"),
		model: "goal",
		placeholder: _("どういった状態になったら嬉しいか"),
		validator: validators.string
	}
	, lastCommunication: {
		type: "label",
		label: _("LastCommunication"),
		model: "lastCommunication",
		get(model) { return model && model.lastCommunication ? moment(model.lastCommunication).fromNow() : "-"; }
	}
	, status: {
		type: "switch",
		label: _("Status"),
		model: "status",
		multi: true,
		default: 1,
		textOn: _("Active"),
		textOff: _("Inactive"),
		valueOn: 1,
		valueOff: 0
	}
};

export default function fieldGenerator(fieldSet) {
	return {
		fields: fieldSet.map(f => { return fields[f]; })
	};
}