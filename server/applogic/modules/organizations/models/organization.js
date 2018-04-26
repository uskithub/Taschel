"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("organizations");
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

let OrganizationSchema = new Schema({
	name: {
		type: String
		, trim: true
	}
	, users : [{
		type: Number
		, ref: "User"
	}]
	, projects : [{
		type: Number
		, ref: "Task"
	}]
	, administrators : [{
		type: Number,
		ref: "User"
	}]
	, metadata: {}

}, schemaOptions);

OrganizationSchema.virtual("code").get(function() {
	return this.encodeID();
});

OrganizationSchema.plugin(autoIncrement.plugin, {
	model: "Organization",
	startAt: 1
});

OrganizationSchema.methods.encodeID = function(id) {
	// idEncode向けに引数を取るように修正
	id = id || this._id;
	return hashids.encodeHex(id);
};

OrganizationSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let Organization = mongoose.model("Organization", OrganizationSchema);

module.exports = Organization;
