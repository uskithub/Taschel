"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("comments");
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

let CommentSchema = new Schema({
	description: {
		type: String
		, trim: true
	}
	, work : {
		type: Number
		, ref: "Work"
    }
    , review : {
		type: Number
		, ref: "Review"
	}
	, replies : [{
		type: Number
		, ref: "Comment"
	}]
	, author : {
		type: Number
		, required: "Please fill in an author ID"
		, ref: "User"
	}
	, isDeleted: {
		// 0: not deleted yet, 1: deleted
		type: Number
		, "default": 0
	}
	, metadata: {}

}, schemaOptions);

CommentSchema.virtual("code").get(function() {
	return this.encodeID();
});

CommentSchema.plugin(autoIncrement.plugin, {
	model: "Comment",
	startAt: 1
});

CommentSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

CommentSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
