import Project from "../entities/project";
import Work from "../entities/work";
import { INITIALIZE, UPDATE_TIMELINE } from "../mutationTypes";
import { assign } from "lodash";
import works from "../repositories/rest/works";
import domainGlue from "../domainGlue";

export default {
	state : {
		// DDD: Entities
		works: []
	}
	, getters : {
		latestWorks(state) { return state.works; }
	}
	// DDD: Usecases
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[INITIALIZE] (state) {
			state.works.splice(0);
		}
		, [UPDATE_TIMELINE] (state, entities) {
			state.works.push(...entities);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: 
		getTimeline({ commit, getters }) {
			const options = {  };
			return works.get(options)
			.then(data => {
				let works = data.map(rawValues => {
					return new Work(rawValues);
				});
				commit(UPDATE_TIMELINE, works);
			})
		}
	}
};