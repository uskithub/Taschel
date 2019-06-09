"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../../../config");
let logger    		= require("../../../../../core/logger");

let db	    		= require("../../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../../libs/hashids")("reviews");
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

let ReviewSchema = new Schema({
	week : {
		type: String // "YYYY-MM-DD"
		, trim: true
	}
	, date: {
		type: String // "YYYY-MM-DD"
		, trim: true
	}
	, works : [{
		type: Number
		, ref: "Work"
	}]
	, highOrderAwakening: {
		type: String
		, trim: true
	}
	, comments : [{
		type: Number
		, ref: "Comment"
	}]
	, author : {
		type: Number
		, required: "Please fill in an author ID"
		, ref: "User"
	}
	, metadata: {}

}, schemaOptions);

ReviewSchema.virtual("code").get(function() {
	return this.encodeID();
});

ReviewSchema.plugin(autoIncrement.plugin, {
	model: "Review"
	, startAt: 1
});

ReviewSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

ReviewSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let ReviewRepository = mongoose.model("Review", ReviewSchema);

module.exports = ReviewRepository;
