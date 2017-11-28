export function getProjects(state) {
	return state.rows_project;
}

export function getMilestones(state) {
	return state.rows_milestone;
}

export function selected(state) {
	return state.selected_milestone;
}