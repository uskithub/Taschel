"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("groups");
let autoIncrement 	= require("mongoose-auto-increment");

let schemaOptions = {
	timestamps: true
	, toObject: {
		virtuals: true
	}
	, toJSON: {
		virtuals: true
	}
};

let GroupSchema = new Schema({
	/**
	 * - kanban
	 * - weekly_yyyy-MM-dd
	 * - daily_yyyy-MM-dd
	 */
	type: {
		type: String
		, trim: true
	}
	/**
	 * - kanban
	 * 	-> 任意の名前（default: TODO/InProgress/Done）
	 * - weekly
	 *  -> Conducive-Urgent/Conducive-Unurgent/Unconducive-Urgent/Unconducive-Unurgent
	 * 
	 */
	, name: {
		type: String
		, trim: true
	}
	, purpose: {
		type: String
		, trim: true
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
	, author : {
		type: Number
		, required: "Please fill in an author ID"
		, ref: "User"
	}
	, lastCommunication: {
		type: Date	
		, "default": Date.now
	}
	, metadata: {}

}, schemaOptions);

GroupSchema.virtual("code").get(function() {
	return this.encodeID();
});

GroupSchema.plugin(autoIncrement.plugin, {
	model: "Group"
	, startAt: 1
});

GroupSchema.methods.encodeID = function(id) {
	id = id || this._id;
	return hashids.encodeHex(id);
};

GroupSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
