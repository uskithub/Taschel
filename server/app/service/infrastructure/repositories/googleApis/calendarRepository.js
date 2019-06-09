"use strict";

const config 			= require("../../../../../config");
const google			= require("googleapis");
const moment 			= require("moment");
const base32Decode		= require("base32-decode");
const base32Encode		= require("base32-encode");

const clientID 		= config.authKeys.google.clientID;
const clientSecret	= config.authKeys.google.clientSecret;

const redirectUrl	= "/auth/google/callback";
const OAuth2		= google.auth.OAuth2;

const EVENT_ID_PREFIX = "taschel:";
const CALENDAR_SOURCE_ID = "Taschel";

//
//  DomainService。業務知識はここで扱う。
//  ERDに関する知識は持ち込まない。
//
module.exports = class CalendarRepository {

	constructor(credentials) {
		this.oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);
		this.oauth2Client.credentials = credentials;
        
		this.calendar = google.calendar("v3");
	}
    
	getEventsFromGoogleCalendar(week) {
		let ret = { google: [], taschel: [] };

		let _week = moment(week);
		const min = _week.format();
		const max = _week.add(5, "d").format();
	
		// @see https://github.com/google/google-api-nodejs-client/blob/master/src/apis/calendar/v3.ts#L1025

		return new Promise((resolve, reject) => {
			this.calendar.events.list({
				// Auth client or API Key for the request
				// auth?: string|OAuth2Client|JWT|Compute|UserRefreshClient;
				auth: this.oauth2Client
				, calendarId: "primary"
				, timeMax: max
				, timeMin: min
				, maxResults: 10
				, singleEvents: true
				, orderBy: "startTime"
			}
			, (err, response) => {
				if (err) { return reject(err); }
				return resolve(response.data.items);
			});
		}).then(items => {
			// Taschelで追加したイベントが重複して表示されないようにしている
			return items.reduce((ret, item, idx) => {

				if (item.source && item.source.title === CALENDAR_SOURCE_ID) {
					// an event is made by taschel.
					const eventId = String.fromCharCode.apply("", new Uint8Array(base32Decode((item.id).toUpperCase(), "RFC4648-HEX")));
					const workId = eventId.replace(EVENT_ID_PREFIX, "");

					// TODO: jsonの中身と比べて、Googleカレンダー側で更新されていたら、workを更新
					ret.taschel.push({
						_id: workId
						, title: item.summary
						, start: item.start.dateTime
						, end: item.end.dateTime
						, week: week
					});			
				} else {
					// TODO: Google Caldndarで追加したイベントにも振り返りを可能にする

					// Google Calendarで作成した予定だけ追加
					ret.google.push({
						code: "GOOGLE_CALENDAR"
						, title: item.summary
						, start: item.start.dateTime
						, end: item.end.dateTime
						, week: week
					});
				}
				return ret;
			}, ret);
		});
	}

	// @see https://github.com/google/google-api-nodejs-client/blob/master/src/apis/calendar/v3.ts#L3433
	addEventToGoogleCalendar(work) {
		
		return new Promise((resolve, reject) => {
			const idEncoded = base32Encode(
				Uint8Array.from(Buffer.from(`${ EVENT_ID_PREFIX }${ work.id }`))
				, "RFC4648-HEX"
				, { padding: false }
			)
				.toLowerCase();

			this.calendar.events.insert(
				// params: Params$Resource$Events$Insert
				{ 
					// Auth client or API Key for the request
					// auth?: string|OAuth2Client|JWT|Compute|UserRefreshClient;
					auth: this.oauth2Client
					, calendarId: "primary"
					, resource: {
						// required
						start: { dateTime: work.start }
						, end: { dateTime: work.end }
						// optional
						, id : idEncoded
						, summary : work.title
						, colorId : "2"
						// , description: ""
						, source : {
							title : CALENDAR_SOURCE_ID
							, url : "https://taschel.com/"
						}
					}
				}
				// callback: BodyResponseCallback<Schema$Event>
				, (err, response) => {
					if (err) { return reject(err); }
					return resolve(response.data);
				});
		});
	}

};