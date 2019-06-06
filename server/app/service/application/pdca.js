const config 			= require("../../../config");
const google			= require("googleapis");
const moment 			= require("moment");
const base32Decode		= require("base32-decode");
const base32Encode		= require("base32-encode");
// const TaskService		= require("../domain/taskService");

const WorkRepository 	= require("../infrastructure/repositories/workRepository");
const UserRepository 	= require("../../../models/user");
const TaskRepository 	= require("../infrastructure/repositories/taskRepository");
// const GroupRepository 	= require("../infrastructure/repositories/groupRepository");

// const taskService = new TaskService();

const clientID 		= config.authKeys.google.clientID;
const clientSecret	= config.authKeys.google.clientSecret;

const redirectUrl	= "/auth/google/callback";
const OAuth2		= google.auth.OAuth2;

const EVENT_ID_PREFIX = "taschel:";
const CALENDAR_SOURCE_ID = "Taschel";

//
//	InteractorはUsecaseを実現する。
//	業務的な知識は domain/xxxService に持たせること。
//
module.exports = class Pdca {
	
	constructor(context) {
		this.context = context;
	}

	getEventsFromGoogleCalendar(week) {
		let ret = { google: [], taschel: [] };
		return UserRepository
			.findById(this.context.user.id)
			.exec()
			.then(doc => {
				if (doc.credentials.access_token === undefined) {
					return ret;
				}

				let _week = moment(week);
				const min = _week.format();
				const max = _week.add(5, "d").format();

				let oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);
				oauth2Client.credentials = doc.credentials;
			
				let calendar = google.calendar("v3");
				// @see https://github.com/google/google-api-nodejs-client/blob/master/src/apis/calendar/v3.ts#L1025
	
				return new Promise((resolve, reject) => {
					calendar.events.list({
						// Auth client or API Key for the request
						// auth?: string|OAuth2Client|JWT|Compute|UserRefreshClient;
						auth: oauth2Client
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
			});
	}

	addEventToGoogleCalendar(work) {
		const userId = this.context.user.id;
		// 本来Promiseだが、待つ必要がないので非同期処理
		return UserRepository
			.findById(userId)
			.exec()
			.then(doc => {
				if (doc.credentials.access_token === undefined) {
					return Promise.reject("no access token");
				}

				let oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);
				oauth2Client.credentials = doc.credentials;

				let calendar = google.calendar("v3");
				// @see https://github.com/google/google-api-nodejs-client/blob/master/src/apis/calendar/v3.ts#L3433

				return new Promise((resolve, reject) => {
					const idEncoded = base32Encode(
						Uint8Array.from(Buffer.from(`${ EVENT_ID_PREFIX }${ work.id }`))
						, "RFC4648-HEX"
						, { padding: false }
					)
						.toLowerCase();

					calendar.events.insert(
						// params: Params$Resource$Events$Insert
						{ 
							// Auth client or API Key for the request
							// auth?: string|OAuth2Client|JWT|Compute|UserRefreshClient;
							auth: oauth2Client
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
			})
			.then(data => {
				console.log("Googleカレンダーへの登録に成功", data);
			})
			.catch(err => {
				console.log("Googleカレンダーへの登録に失敗", err.message);
			});
	}

	自分のその週のワーク一覧を取得する(week) {
		const filter = {
			asignee : this.context.user.id
			, week : week
		};

		const query = WorkRepository.find(filter);
		return this.context
			.queryPageSort(query)
			.exec();
	}

	ワークを追加する(work) {
		return WorkRepository.create(work)
			.then(doc => {
			// 同時に親のTaskに追加
				return TaskRepository.findByIdAndUpdate(
					doc.parent
					, { $addToSet : { works: doc.id }}
				).then(() => {
					return doc;
				});
			});
	}

	ワークを編集する(workId, valuesForUpdate) {
		return WorkRepository.findByIdAndUpdate(
			workId
			, { $set : valuesForUpdate }
			, { "new" : true }
		);
	}

	// Workを親Taskから削除し、親Taskを返します
	ワークを削除する(workId, parentTaskId) {
		return WorkRepository.remove({ _id: workId })
			.then(() => {
				return TaskRepository
					.findByIdAndUpdate(
						parentTaskId
						, { $pull : { works: workId }}
						, { "new" : true }
					);
			});
	}
};