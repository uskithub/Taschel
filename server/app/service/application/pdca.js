const config 			= require("../../../config");
const google			= require("googleapis");
const moment 			= require("moment");
const base32Decode		= require("base32-decode");
const base32Encode		= require("base32-encode");
// const TaskService		= require("../domain/taskService");

const WorkRepository 	= require("../infrastructure/repositories/monogodb/workRepository");
const ReviewRepository 	= require("../infrastructure/repositories/monogodb/reviewRepository");
const UserRepository 	= require("../../../models/user");
const TaskRepository 	= require("../infrastructure/repositories/monogodb/taskRepository");
// const GroupRepository 	= require("../infrastructure/repositories/groupRepository");

const CalendarRepository 	= require("../infrastructure/repositories/googleApis/CalendarRepository");

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

				const calendarRepository = new CalendarRepository(doc.credentials);
				return calendarRepository.getEventsFromGoogleCalendar(week);
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

				const calendarRepository = new CalendarRepository(doc.credentials);
				return calendarRepository.addEventToGoogleCalendar(work);
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

	自分のその週のレビュー一覧を取得する(week) {
		const filter = {
			author : this.context.user.id
			, week : week
		};

		const query = ReviewRepository.find(filter);
		return this.context
			.queryPageSort(query)
			.exec();
	}

	日次レビューする(review) {
		return ReviewRepository.create(review)
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
};