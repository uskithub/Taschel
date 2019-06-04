"use strict";

let logger 			= require("../../../../core/logger");
let config 			= require("../../../../config");
let response		= require("../../../../core/response");
let C 	 			= require("../../../../core/constants");

let _				= require("lodash");

let TaskRepository	= require("../../infrastructure/repositories/taskRepository");
let GroupRepository = require("../../infrastructure/repositories/groupRepository");

const Backog = require("../../application/backlog");
const Groundwork = require("../../application/groundwork");

const notImplementedError = (funcName) => {
	const msg = `TODO: ${this.constructor.name}.${funcName} は未実装です。`;
	let err = new Error(msg);
	err = _.defaults(response.NOT_IMPLEMENTED);
	err.message = msg;
	return err;
};

//
//	PresenterはAPIとUsecaseの間の「検問」を行う
//
module.exports = {
	settings: {
		name: "tasks"
		, version: 1
		, namespace: "tasks"
		, rest: true
		, ws: false
		, graphql: false
		, permission: C.PERM_LOGGEDIN
		, role: "user"
		, collection: TaskRepository
		
		, modelPropFilter: "code projectType type properties purpose name shortname goal description deadline manhour schedule root parent children works status closingComment author asignee isDeleted lastCommunication createdAt updatedAt"

		// TODO: populateModelsを改造すれば、下にのみpopulate、上にのみpopulateもできる
		, modelPopulates: {
			// "root": "tasks"			// 親にchildrenを持たせたので、populateすると循環参照になってpopulateが終わらなくなるので注意
			// , "parent": "tasks"		//
			"children": "tasks"
			, "works": "works"
			, "author": "persons"	// TODO: 情報量が多くなりすぎるのpopulateを削る
			, "asignee": "persons"
		}
		, idEncodes: {
			"root": "tasks"
			, "parent": "tasks"
		}
	}
	
	, actions: {
		find: {
			cache: true
			, handler(ctx) {
				// DEBUG
				// if (ctx.params.check) { return this.actions.check(ctx); }

				const userId = this.personService.decodeID(ctx.params.user_code);
				const backlog = new Backog(ctx);

				if (ctx.params.type !== undefined) {

					return backlog.自分のプロジェクト一覧を取得する(userId)
						.then(docs => {
							return this.toJSON(docs);
						})
						.then(json => {
							return this.populateModels(json);
						});

				} else if (ctx.params.user_code !== undefined) {
					
					return backlog.自分のタスク一覧を取得する(userId)
						.then(docs => {
							return this.toJSON(docs);
						})
						.then(json => {
							return this.populateModels(json);
						});

				} else {
					throw notImplementedError("tasks.find");
				}
			}
		}

		// return a model by ID
		, get: {
			cache: true
			, handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
				return Promise.resolve(ctx.model);
			}
		}

		, create(ctx) {
			this.validateParams(ctx, true);

			if (ctx.params.type === "project") {
				const groundwork = new Groundwork(ctx);
				const newProject = {
					type			: ctx.params.type
					, projectType	: ctx.params.projectType 
					, properties	: ctx.params.properties
					, name			: ctx.params.name
					, shortname		: ctx.params.shortname
					, purpose		: ctx.params.purpose
					, goal			: ctx.params.goal
					, description	: ctx.params.description
					, status		: ctx.params.status
					, deadline		: ctx.params.deadline
					, manhour		: (ctx.params.manhour != undefined) ? ctx.params.manhour : -1
					, root			: (ctx.params.root_code != undefined) ? this.decodeID(ctx.params.root_code) : -1
					, parent		: (ctx.params.parent !== undefined) ? this.decodeID(ctx.params.parent) : -1
					, author		: (ctx.params.author != undefined) ? this.personService.decodeID(ctx.params.author) : ctx.user.id
					, asignee		: (ctx.params.asignee !== undefined) ? this.personService.decodeID(ctx.params.asignee) : -1
				};

				return groundwork.新しいプロジェクトを追加する(newProject)
					.then(doc => {
						return this.toJSON(doc);
					})
					.then(json => {
						return this.populateModels(json);
					});

			} else {
				const backlog = new Backog(ctx);
				const parentId = (ctx.params.parent !== undefined) ? this.decodeID(ctx.params.parent) : -1;

				const newTask = {
					type			: ctx.params.type
					, projectType	: ctx.params.projectType 
					, properties	: ctx.params.properties
					, name			: ctx.params.name
					, purpose		: ctx.params.purpose
					, goal			: ctx.params.goal
					, description	: ctx.params.description
					, status		: ctx.params.status
					, deadline		: ctx.params.deadline
					, manhour		: (ctx.params.manhour != undefined) ? ctx.params.manhour : -1
					, root			: (ctx.params.root_code != undefined) ? this.decodeID(ctx.params.root_code) : -1
					, parent		: parentId
					, author		: (ctx.params.author != undefined) ? this.personService.decodeID(ctx.params.author) : ctx.user.id
					, asignee		: (ctx.params.asignee !== undefined) ? this.personService.decodeID(ctx.params.asignee) : -1
				};

				return backlog.新しいタスクを追加する(parentId, newTask)
					.then(doc => {
						return this.toJSON(doc);
					})
					.then(json => {
						return this.populateModels(json);
					});
			}				
		}

		, update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
			this.validateParams(ctx);

			const valuesForUpdate = Object.keys(TaskRepository.schema.obj)
				.reduce((valuesForUpdate, key) => {
					const value = ctx.params[key];
					if (value) { 
						if (key === "parent") {
							valuesForUpdate[key] = Number(this.decodeID(value));
						} else if (key === "children") {
							valuesForUpdate[key] = value.map(code => { return Number(this.decodeID(code)); });
						} else {
							valuesForUpdate[key] = value;	
						}
					}
					return valuesForUpdate;
				}, {});

			console.log("&&&", valuesForUpdate);

			// for v2 arrange
			if (ctx.req.method === "PATCH") {
				const backlog = new Backog(ctx);
				return backlog.タスクを更新する(ctx.modelID, valuesForUpdate)
					.then(doc => {
						return this.toJSON(doc);
					})
					.then(json => {
						return this.populateModels(json);
					});
			}

			// for v1
			if (ctx.params.arrange) {
				return this.actions.arrange(ctx, ctx.params.arrange);
			}

			if (ctx.params.task) {
				return this.actions.arrange2(ctx);
			}

			return this.collection.findById(ctx.modelID).exec()
				.then(doc => {
					if (ctx.params.purpose != null)
						doc.purpose = ctx.params.purpose;

					if (ctx.params.root_code != null) {
						doc.root = this.decodeID(ctx.params.root_code);
						// TODO: parentを取得し、rootがblankの場合、同じrootを指定、blankでなければ親子のreleationを切り離す、を先祖に遡って実施
						// TODO: 全ての子孫を再帰的に、同じrootを指定する必要あり
					}

					if (ctx.params.type != null)
						doc.type = ctx.params.type;

					if (ctx.params.projectType != null)
						doc.projectType = ctx.params.projectType;

					if (ctx.params.properties != null)
						doc.properties = ctx.params.properties;

					if (ctx.params.name != null)
						doc.name = ctx.params.name;

					if (ctx.params.shortname != null)
						doc.shortname = ctx.params.shortname;

					if (ctx.params.goal != null)
						doc.goal = ctx.params.goal;

					if (ctx.params.description != null)
						doc.description = ctx.params.description;

					doc.deadline = ctx.params.deadline;

					if (ctx.params.manhour != null)
						doc.manhour = ctx.params.manhour;

					doc.schedule = ctx.params.schedule;

					if (ctx.params.status != null)
						doc.status = ctx.params.status;

					if (ctx.params.asignee_code != null)
						doc.asignee = this.personService.decodeID(ctx.params.asignee_code);

					if (ctx.params.closingComment != null)
						doc.closingComment = ctx.params.closingComment;

					if (ctx.params.lastCommunication != null)
						doc.lastCommunication = ctx.params.lastCommunication;

					return doc.save();
				})
				.then(doc => {
					return this.toJSON(doc);
				})
				.then(json => {
					return this.populateModels(json);
				})
				.then(json => {
					this.notifyModelChanges(ctx, "updated", json);
					return json;
				});								
		}

		// TODO: 親からの参照を外す、childrenも再帰的に削除
		, remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:TaskNotFound"));
			
			// 物理削除の場合
			//return Task.remove({ _id: ctx.modelID })

			// 論理削除とする
			return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					doc.isDeleted = true;
					return doc.save();
				})
				.then(() => {
					return ctx.model;
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "removed", json);
					return json;
				});		
		}

		// タスクの入れ替え
		, arrange(ctx, type) {
			// TODO: バリデータ
			// ?arrange=above&target=${target.code}&targetParent=${target.parent.code}

			let movingId = this.decodeID(ctx.params.code);
			let targetId = this.decodeID(ctx.params.target);
			let targetParentId = this.decodeID(ctx.params.targetParent);
			let parentId = this.decodeID(ctx.params.parent);
			
			let promises = [];

			// movingがtargetの兄になる
			// 1. (moving->parent).cildrenからmovingを削除
			// 2. moving.parentにtarget.parentを設定
			// 3. (target->parent).childrenにmovingを追加（targetの前に）

			// movingがtargetの子になる
			// 1. (moving->parent).cildrenからmovingを削除
			// 2. moving.parentにtargetを設定
			// 3. target.childrenにmovingを追加（先頭）

			// movingがtargetの弟になる
			// 1. (moving->parent).cildrenからmovingを削除
			// 2. moving.parentにtarget.parentを設定
			// 3. (target->parent).childrenにmovingを追加（targetの後に）
			
			// above/into/below共通
			// 1. (moving->parent).cildrenからmovingを削除
			promises.push(this.collection.findById(parentId).exec()
				.then(parentDoc => {
					parentDoc.children = parentDoc.children.filter(c => c != movingId);
					return parentDoc.save();
				
				}).then(parentDoc => {
					// into 3. target.childrenにmovingを追加（先頭）
					if (type == "into") {
						return this.collection.findById(targetId).exec()
							.then((targetDoc) => {
								targetDoc.children.unshift(movingId);
								targetDoc.save();
								return [parentDoc, targetDoc];
							});
					}

					// above 3. (target->parent).childrenにmovingを追加（targetの前に）
					// below 3. (target->parent).childrenにmovingを追加（targetの後に）
					return Promise.resolve()
						.then(() => {
							// 親が同じ中で入れ替えの場合はわざわざfindしない
							if (parentId == targetParentId) {
								return parentDoc;
							} else {
								return this.collection.findById(targetParentId).exec();
							}
						}).then(targetParentDoc => {
							let index = 0;
							for (let i in targetParentDoc.children) {
								let c = targetParentDoc.children[i];
								if (c == targetId) {
									break;
								}
								index++;
							}
							console.log("● before:", targetParentDoc.children);
							targetParentDoc.children.splice((type=="below" ? index+1 : index), 0, movingId);
							console.log("● after :", targetParentDoc.children);
							targetParentDoc.save();
		
							return [parentDoc, targetParentDoc];
						});
				})
			);
			
			promises.push(this.collection.findById(movingId).exec()
				.then(movingDoc => {
					if (type == "into") {
						// into 2. moving.parentにtargetを設定
						movingDoc.parent = targetId;
					} else {
						// above/below共通
						// 2. moving.parentにtarget.parentを設定
						movingDoc.parent = targetParentId;
					}
					movingDoc.save();
					return movingDoc;
				})
			);

			return Promise.all(promises)
				.then(docs => {
					// flatten
					return [docs[1], docs[0][0], docs[0][1]];
				})
				.then(docs => {
					return this.toJSON(docs);
				})
				.then(jsons => {
					return this.populateModels(jsons);
				})
				.then(jsons => {
					this.notifyModelChanges(ctx, "arranged", jsons);
					if (type == "into") {
						return {
							// ここでのkeyは入れ替え前の「movingParent」
							moving : jsons[0]
							, movingParent : jsons[1]
							, target : jsons[2]
							
						};
					} else {
						return {
							moving : jsons[0]
							, movingParent : jsons[1]
							, targetParent : jsons[2]
						};
					}
				});			
		}

		, arrange2(ctx) {
			let movingId = this.decodeID(ctx.params.task);
			let index = ctx.params.index;

			// ① from, to => task, task			/api/tasks/${to}?task=${moving}&index=${index}&from=${from}
			//	  1. from, to => xxx, yyy
			//		- toに追加
			//		- fromから削除
			//      - movingの親をtoに
			//	  2. from, to => xxx, xxx
			//		- to（=from）内で移動
			return Promise.resolve()
				.then(() => {
					let toId = ctx.modelID;
					let fromId = this.decodeID(ctx.params.from);
					if (toId != fromId) {
						// ①-1. from, to => xxx, yyy
						return this.collection.findById(toId).exec()
							.then(doc => {
								doc.children.splice(index, 0, movingId);
								return doc.save()
									.then(toDoc => {
										return this.collection.findById(fromId).exec()
											.then(fromDoc => {
												fromDoc.children = fromDoc.children.filter( c => { return c != movingId; });
												return fromDoc.save();
											})
											.then(fromDoc => {
												return this.collection.findById(movingId).exec()
													.then(movingDoc => {
														movingDoc.parent = toId;
														return movingDoc.save();
													})
													.then(movingDoc => {
													// 	return this.toJSON([toDoc, fromDoc, movingDoc]);
													// })
													// .then(jsons => {
													// 	return this.populateModels(jsons);
													// })
													// .then(jsons => {
													// 	// Groups find will use cache. So putting task docs into cache here.
													// 	this.putToCache(this.getCacheKey("model", toId), jsons[0]);
													// 	this.putToCache(this.getCacheKey("model", fromId), jsons[1]);
													// 	this.putToCache(this.getCacheKey("model", movingId), jsons[2]);
														// return [toDoc, fromDoc, movingDoc];
														return this.groupService.actions.find(ctx);
													});
											});
									});
							});
					} else {
						// ①-2. from, to => xxx, xxx
						return this.collection.findById(toId).exec()
							.then(doc => {
								doc.children = doc.children.filter( c => { return c != movingId; });
								doc.children.splice(index, 0, movingId);
								return doc.save()
									.then(doc => {
										// return [doc];
										return this.groupService.actions.find(ctx);
									});
							});
					}
				});
		}
		// 親子関係、rootの整合性をチェックする
		, check(ctx) {
			let recursiveReduceCheck = (children, parent, rootId, result = { entities:[], errors:[] }) => {
				return children.reduce((data, child) => {
					const cid = this.decodeID(child.code);
					const cpid = (child.parent == -1) ? -1 : this.decodeID(child.parent);
					const crid = (child.root == -1) ? -1 : this.decodeID(child.root);
					const pid = this.decodeID(parent.code);
					if (parent.type == "project") {
						if (parent.parent && parent.parent != -1) {
							const ppid = this.decodeID(parent.parent);
							data.errors.push(`project[${pid}] must not have any parent(parent[${ppid}])`);
						}
					}
					if (cpid != pid) {
						data.errors.push(`child[${cid}].parent[${cpid}] != parent[${pid}].code`);
					}
					if (crid != rootId) {
						data.errors.push(`child[${cid}].root[${crid}] != root[${rootId}].code`);
					}
					
					data.entities.push(cid);

					if (child.children == null || child.children.length == 0) {
						return data;
					} else {
						return recursiveReduceCheck(child.children, child, rootId, data);
					}
				}, result);
			};

			return this.collection.find({ root : -1 }).exec()
				.then(docs => {
					return this.toJSON(docs);
				})
				.then(jsons => {
					return this.populateModels(jsons);
				})
				.then(jsons => {
					return jsons.reduce((obj, project) => {
						const rootId = this.decodeID(project.code);
						return recursiveReduceCheck(project.children, project, rootId, obj);
					}, { entities:[], errors:[] });
				});
		}
	}
	
	, methods: {
		/**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 * 
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
		validateParams(ctx, strictMode) {
			if (strictMode || ctx.hasParam("name"))
				ctx.validateParam("name").trim().notEmpty(ctx.t("app:TaskNameCannotBeBlank")).end();

			if (strictMode || ctx.hasParam("status"))
				ctx.validateParam("status").isNumber();

			ctx.validateParam("purpose").trim().end();
			ctx.validateParam("goal").trim().end();
			// ctx.validateParam("type").trim().end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	}

	, init(ctx) {
		// Fired when start the service
		this.personService = ctx.services("persons");
		this.groupService = ctx.services("groups");
		this.workService = ctx.services("works");
	}
};
