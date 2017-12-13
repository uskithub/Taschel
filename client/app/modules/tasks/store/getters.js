
// stateから値を取り出すのはgetterを使う

export function projects(state) {
	return state.projects;
}

export function tasks(state) {
	return state.tasks;
}

export function users(state) {
	return state.users;
}

export function selectedProject(state) {
	return state.selectedProject;
}

export function selectedTasks(state) {
	return state.selectedTasks;
}