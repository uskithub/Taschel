export default class Timeframe {

	/**
	 * 
	 * 
	 * 
	 * @param {*} treenode 
	 * @param {*} latestFinishTime
	 * @param {*} start 
	 * @param {*} end 
	 * @param {*} cellWidth 
	 */
	constructor(treenode, start, end, cellWidth) {
		this._task = treenode.task;
		this._start = start;
		this._end = end;
		this._cellWidth = cellWidth;
	}

	get id() { return this._task.code; }
	get name() { return this._task.name; }

	get deadline() {
		// 自身が期日をもつ場合
		const _deadline = this._task.deadline;
		if (_deadline) {
			// かつsubsequencesのある場合
			if (this._task.subscequences && this._task.subscequences.length > 0 ) {
				// subsequencesのうち一番早いscheduleの前日と、自身の期日とで早い方が期日となる
				return this._task.subscequences.reduce((deadline, s) => {
					const latestFinishTime = moment((new Timeframe(s)).schedule).add(-1, "day");
					if (!deadline.isBefore(latestFinishTime)) {
						return latestFinishTime;
					}
					return deadline;
				}, _deadline);
			} else { // かつsubsequencesのない場合、それが期日となる
				return _deadline;
			}

		} else { // 自身が期日を持たない場合
			const _parentDeadline = (new Timeframe(this._task.parent)).deadline;
			// かつsubsequencesのある場合
			if (this._task.subscequences && this._task.subscequences.length > 0 ) {
				// subsequencesのうち一番早いscheduleの前日と、親の期日とで早い方が期日となる
				return this._task.subscequences.reduce((deadline, s) => {
					const latestFinishTime = moment((new Timeframe(s)).schedule).add(-1, "day");
					if (!deadline.isBefore(latestFinishTime)) {
						return latestFinishTime;
					}
					return deadline;
				}, _parentDeadline);
			} else { // かつsubsequencesのない場合、親の期日が期日となる
				return _parentDeadline;
			}
		}
	}

	get manhours() {
		const _timeframe = this._task.timeframe;
		if (_timeframe) {
			// かつschildrenのある場合
			if (this._task.children && this._task.children.lenght > 0) {
				// childrenのうち一番早いscheduleの前日と、自身の期日とで早い方が期日となる
			} else {
				return _timeframe;
			}

		} else {

		}
		return ();
	}
	
	/**
	 * 自身がmilestone
	 */
	get type() {
		if (this._task.type === "milestone") {
			return "milestone";
		} else 

	}

	get isDisplay() { 
		// TODO
		// 自分がmilestonの場合
		// 祖先にmilestoneがある場合
		return true;
	}
	get width() { 
		// TODO
		return 500; 
	}
	get offset() { 
		// TODO
		return 100; 
	}
}