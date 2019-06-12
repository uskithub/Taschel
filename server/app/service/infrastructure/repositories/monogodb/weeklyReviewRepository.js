"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../../../config");
let logger    		= require("../../../../../core/logger");

let db	    		= require("../../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../../libs/hashids")("weeklyReviews");
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

let WeeklyReviewSchema = new Schema({
	week : {
		type: String // "YYYY-MM-DD"
		, trim: true
	}

	, items : [{
		type: Number
		, ref: "ReviewItem"
	}]
	, author : {
		type: Number
		, required: "Please fill in an author ID"
		, ref: "User"
	}
	, metadata: {}

}, schemaOptions);

WeeklyReviewSchema.virtual("code").get(function() {
	return this.encodeID();
});

WeeklyReviewSchema.plugin(autoIncrement.plugin, {
	model: "WeeklyReview"
	, startAt: 1
});

WeeklyReviewSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

WeeklyReviewSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let WeeklyReviewRepository = mongoose.model("WeeklyReview", WeeklyReviewSchema);

module.exports = WeeklyReviewRepository;
