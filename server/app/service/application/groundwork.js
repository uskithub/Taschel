
const TaskService		= require("../domain/taskService");
const TaskRepository 	= require("../infrastructure/repositories/taskRepository");
const GroupRepository 	= require("../infrastructure/repositories/groupRepository");

const taskService = new TaskService();

const DEFAULT_KANBAN_GROUPS = [
	{ name: "TODO", purpose: "for_the_tasks_to_do_from_now" }
	, { name: "IN_PROGRESS", purpose: "for_the_tasks_now_people_doing" }
	, { name: "DONE", purpose: "for_the_tasks_finished_already" }
];

//
//	InteractorはUsecaseを実現する。
//	業務的な知識は domain/xxxService に持たせること。
//
module.exports = class Groundwork {
	
	constructor(context) {
		this.context = context;
	}

	新しいプロジェクトを追加する(project) {
		return TaskRepository.create(project)
			.then(doc => {
				// kanbanを作る
				// 配列の順番になるように、reduceで作っている
				return DEFAULT_KANBAN_GROUPS
					.reduce((promise, g) => {
						return promise.then(()=> {
							g.type = "kanban";
							g.parent =  doc.id;
							g.author = doc.author;
							return GroupRepository.create(g);
						});
					}, Promise.resolve())
					.then(() => {
						return doc;
					});
			});
	}

};