module.exports = {
	taskTypes: [
		// { id: "project", name: _("Project") }
		// { id: "subproject", name: _("Subproject") }
		{ id: "milestone", name: _("Milestone") }
		, { id: "requirement", name: _("Requirement") }
		, { id: "way", name: _("Way") }
		, { id: "step", name: _("Step") }
		// , { id: "work", name: "Work" }
	]

	, groupTypes: [
		{ id: "kanban", name: _("Kanban") }
		, { id: "weekly", name: _("Weekly") }
		, { id: "daily", name: _("Daily") }
		
	]
};