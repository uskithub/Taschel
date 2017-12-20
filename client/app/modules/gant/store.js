import { SELECT, UPDATE, ADD } from "../common/constants/mutationTypes";

import { each, find, assign, remove, isArray } from "lodash";

// TODO: GantだけProject読み込み時にPopulateさせているのでSharedと分けるかもしれないので残している
const state = {
	targetNode: null
};

const getters = {
	targetNode(state) { return state.targetNode; }
};

const mutations = {
	[SELECT] (state, model) {
		state.targetNode = model;
	}
	, [UPDATE] (state, model) {
		state.targetNode = model;
	}
	, [ADD] (state, model) {
		// noop
	}
};

import { createTask, readTasks, updateTask, deleteTask, arrangeTask } from "../common/actions/tasks";
import { readUsers } from "../common/actions/persons";

export default {
	namespaced : true
	, state
	, getters
	, actions : { createTask, readTasks, updateTask, deleteTask, arrangeTask, readUsers }
	, mutations
};