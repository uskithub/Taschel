import Vue from "vue";
const _ = Vue.prototype._;

export const projectTypes = [
	{ id: "individual", name: _("Individual") }
	, { id: "organization-public", name: _("OrganizationPublic") }
	, { id: "organization-closed", name: _("OrganizationClosed") }
];

export const taskTypes = [
	// { id: "project", name: _("Project") }
	{ id: "subproject", name: _("Subproject") }
	, { id: "milestone", name: _("Milestone") }
	, { id: "requirement", name: _("Requirement") }
	, { id: "way", name: _("Way") }
	, { id: "step", name: _("Step") }
	, { id: "todo", name: _("ToDo") }
	// , { id: "work", name: "Work" }
];

export const taskProperties = [
	{ id: "subproject", name: _("Subproject") }
	, { id: "objective", name: _("Objective") }
	, { id: "keyresult", name: _("KeyResult") }
	, { id: "milestone", name: _("Milestone") }
	, { id: "requirement", name: _("Requirement") }
	, { id: "issuue", name: _("Issue") }
	, { id: "way", name: _("Way") }
];

export const groupTypes = [
	{ id: "kanban", name: _("Kanban") }
	, { id: "weekly", name: _("Weekly") }
	, { id: "daily", name: _("Daily") }	
];

export const organizationTypes = [
	{ id: "normal", name: _("Normal") }
	, { id: "enterprize", name: _("Enterprize") }
];

export const roles = [
	{ id: "administrator", name: _("Administrator") }
	, { id: "member", name: _("Member") }
];