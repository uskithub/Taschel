// TODO: SETとLOADの使い分けができていないのでどうにかする

export const COMMON = {
	GET_READY : "GET_READY"
};

export const SESSION = {
	SET_USER : "SET_USER"
	, SET_USER_PROFILE : "SET_USER_PROFILE"
	, SET_USER_ORGNIZATIONS : "SET_USER_ORGNIZATIONS"
	, LOAD_PROJECTS : "LOAD_PROJECTS"
	, SET_CURRENT_PROJECT : "SET_CURRENT_PROJECT"
	, ADD_PROJECT : "ADD_PROJECT"
	, UPDATE_PROJECT : "UPDATE_PROJECT"
	, CLOSE_PROJECT : "CLOSE_PROJECT"
};

export const BACKLOG = {
	SET_USER_TASKS : "SET_USER_TASKS"
	, SET_TASK_TREE : "SET_TASK_TREE"
	, ADD_TASK : "ADD_TASK"
	, UPDATE_TASK : "UPDATE_TASK"
	, CLOSE_TASK : "CLOSE_TASK"
};

export const PDCA = {
	// for WeeklyLoop
	LOAD_WEEKLY_GROUPS : "LOAD_WEEKLY_GROUPS"
	// for dailyLoop
	, LOAD_CURRENTWEEK_TASK_GROUP : "LOAD_CURRENTWEEK_TASK_GROUP"
	, LOAD_WEEKLY_WORKS : "LOAD_WEEKLY_WORKS"
	, LOAD_WEEKLY_REVIEWS : "LOAD_WEEKLY_REVIEWS"
	, ADD_WORK : "ADD_WORK"
};