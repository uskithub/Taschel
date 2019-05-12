import { FEEDBACK } from "service/application/mutationTypes";

// Usecases
import {
	タイムラインを取得する
} from "service/application/usecases";

// Repositories
import works from "service/infrastructure/repositories/rest/works";

// Entities
import Work from "service/domain/entities/work";


export default {
	state : {
		// DDD: Entities
		works: []
	}
	, getters : {
		latestWorks(state) { return state.works; }
	}
	// Vuex: Mutations can change states. It must run synchronously.
	, mutations : {
		[FEEDBACK.UPDATE_TIMELINE] (state, entities) {
			state.works.push(...entities);
		}
	}

	// DDD: Usecases
	// Vuex: Actions can execute asynchronous transactions.
	, actions : {
		// Usecase: 
		[タイムラインを取得する]({ commit, getters }) {
			const options = {  };
			return works.get(options)
				.then(data => {
					let works = data.map(rawValues => {
						return new Work(rawValues);
					});
					commit(FEEDBACK.UPDATE_TIMELINE, works);
				});
		}
	}
};