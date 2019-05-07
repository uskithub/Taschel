"use strict";

// js-all
const WEBHOOK_URL = "https://hooks.slack.com/services/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";
// yusuke
// const WEBHOOK_URL = "https://hooks.slack.com/services/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";

let _ = require("lodash");
let request = require("request");

function postMessage(text) {
	let options = {
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

module.exports = {
	postMessage
};