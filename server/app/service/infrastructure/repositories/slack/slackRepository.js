"use strict";

let _ = require("lodash");
let request = require("request");

// js-all
// const WEBHOOK_URL = "https://hooks.slack.com/services/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";
// yusuke
const WEBHOOK_URL = "https://hooks.slack.com/services/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";

//
//  DomainService。業務知識はここで扱う。
//  ERDに関する知識は持ち込まない。
//
module.exports = class SlackRepository {

	constructor() { }
    
	postMessage(text) {
		const options = {
			url: WEBHOOK_URL
			, json: true
			, form: `payload={"text": "${text}"}`
		};
    
		return new Promise((resolve, reject) => {
			request.post(options, (error, response, body) => {
				if (error)
					return reject(error);
        
				if (response.statusCode >= 400)
					return reject("Response error:" + response.statusCode + " " + response.statusMessage);
        
				return resolve(body);
			});
		});
	}

};