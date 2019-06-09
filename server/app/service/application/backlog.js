
const TaskService		= require("../domain/taskService");
const TaskRepository 	= require("../infrastructure/repositories/monogodb/taskRepository");

const taskService = new TaskService();

//
//	InteractorはUsecaseを実現する。
//	業務的な知識は domain/xxxService に持たせること。
//
module.exports = class Backlog {
	
	constructor(context) {
		this.context = context;
	}

	自分のプロジェクト一覧を取得する(userId) {

		// TODO: 今は組織で絞り込み、ユーザが参画するプロジェクトに絞り込みができていないのでできるようにす
		const filter = {
			type : "project"
			, isDeleted : { $eq: 0 }
			, status : { $gt : -1 }
		};

		const query = TaskRepository.find(filter);

		return this.context
			.queryPageSort(query)
			.exec();
	}
	
	自分のタスク一覧を取得する(userId) {
		
		const filter = {
			$or : [ {author : userId}, {asignee : userId} ]
			, type : { $ne: "project" }
			, isDeleted : { $eq: 0 }
			, status : { $gt : -1 }
		};

		const query = TaskRepository.find(filter);

		return this.context
			.queryPageSort(query)
			.exec();
	}

	新しいタスクを追加する(parentId, task) {
		return TaskRepository.create(task)
			.then(doc => {
				if (parentId) {
					// 同時に親の子としてタスクを加える
					const childId = doc.id;
					return TaskRepository.findByIdAndUpdate(
						parentId
						, { $addToSet : { children: childId }}
					).then(() => {
						return doc;
					});
				} else {
					return doc;
				}
			});
	}

	タスクを更新する(taskId, valuesForUpdate) {
		return TaskRepository.findByIdAndUpdate(
			taskId
			, { $set : valuesForUpdate }
			, { "new" : true }
		);
	}
};