
const TaskService		= require("../domain/taskService");
const TaskRepository 	= require("../infrastructure/repositories/taskRepository");

const taskService = new TaskService();

//
//	InteractorはUsecaseを実現する。
//	業務的な知識は domain/xxxService に持たせること。
//
module.exports = class Groundwork {
	
	constructor(context) {
		this.context = context;
		this.repository = TaskRepository;	
	}

	新しいプロジェクトを追加する(project) {

		return this.repository.create(project);
	}

};