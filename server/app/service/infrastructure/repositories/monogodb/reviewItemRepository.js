"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../../../config");
let logger    		= require("../../../../../core/logger");

let db	    		= require("../../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../../libs/hashids")("reviewItems");
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

let ReviewItemSchema = new Schema({
	week : {
		type: String // "YYYY-MM-DD"
		, trim: true
	}
	, type : {
		type: String
		, trim: true
	}
	, work: {
		type: Number
		, ref: "Work"
	}
	, review: {
		type: Number
		, ref: "Review"
	}
	, abstraction : {
		type: String
		, trim: true
	}
	, diversion : {
		type: String
		, trim: true
	}
	, author : {
		type: Number
		, required: "Please fill in an author ID"
		, ref: "User"
	}
	, metadata: {}

}, schemaOptions);

ReviewItemSchema.virtual("code").get(function() {
	return this.encodeID();
});

ReviewItemSchema.plugin(autoIncrement.plugin, {
	model: "ReviewItem"
	, startAt: 1
});

ReviewItemSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

ReviewItemSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let ReviewItemRepository = mongoose.model("ReviewItem", ReviewItemSchema);

module.exports = ReviewItemRepository;
