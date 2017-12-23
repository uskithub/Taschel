"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("tasks");
let autoIncrement 	= require("mongoose-auto-increment");

let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

let TaskSchema = new Schema({
	type: {
		type: String,
		trim: true
	}
	, name: {
		type: String,
		trim: true
	}
	, purpose: {
		type: String,
		trim: true
	}
	, goal: {
		type: String,
		trim: true
	}
	, status: {
		type: Number,
		"default": 1
	}
	// projectのid
	, root : {
		// おそらくこれでもOK
		// type: Schema.Types.ObjectId, ref: "Task"
		type: Number
		, ref: "Task"
	}
	// 親タスクのid
	, parent : {
		type: Number
		, ref: "Task"
	}
	, children : [{
		type: Number
		, ref: "Task"
	}]
	, works : [{
		type: Number
		, ref: "Work"
	}]
	, author : {
		type: Number,
		required: "Please fill in an author ID",
		ref: "User"
	}
	, asignee : {
		type: Number,
		ref: "User"
	}
	, lastCommunication: {
		type: Date,	
		"default": Date.now
	}
	, metadata: {}

}, schemaOptions);

TaskSchema.virtual("code").get(function() {
	return this.encodeID();
});

TaskSchema.plugin(autoIncrement.plugin, {
	model: "Task",
	startAt: 1
});

TaskSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

TaskSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
