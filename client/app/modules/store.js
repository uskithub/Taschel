import shared from "./common/store";
import ganttPage from "./gantt/store";
import kanbanPage from "./kanban/store";
import mytasksPage from "./mytasks/store";
import projectsPage from "./projects/store";
import tasksPage from "./tasks/store";
import weeklyPage from "./weekly/store";
import dailyPage from "./daily/store";
import dailyReviewPage from "./daily-review/store";

export default {
	modules: {
		shared
		, ganttPage
		, kanbanPage
		, mytasksPage
		, projectsPage
		, tasksPage
		, weeklyPage
		, dailyPage
		, dailyReviewPage
	}
};