"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("works");
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

let WorkSchema = new Schema({
	title: {
		type: String
		, trim: true
	}
    , start: {
		type: Date
	}
	, end: {
		type: Date
	}
	// rootはないタスクもあるので、使わない方がいいと判断した
	// , root : {
	// 	// おそらくこれでもOK
	// 	// type: Schema.Types.ObjectId, ref: "Task"
	// 	type: Number
	// 	, ref: "Task"
	// }
	, week : {
		type: String
		, trim: true
	}
	// 親タスクのid
	, parent : {
		type: Number
		, ref: "Task"
	}
	
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

WorkSchema.virtual("code").get(function() {
	return this.encodeID();
});

WorkSchema.plugin(autoIncrement.plugin, {
	model: "Work",
	startAt: 1
});

WorkSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

WorkSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let Work = mongoose.model("Work", WorkSchema);

module.exports = Work;