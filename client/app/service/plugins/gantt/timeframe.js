import moment from "moment";

export default class Timeframe {

	constructor(task, parentTimeframe = null) {
		this._task = task;
		this._parentTimeframe = parentTimeframe;

		// Unix Timestamp (milliseconds)
		this._deadline = null;
		this._schedule = null;
		
		this._offset = null;
		this._width = null;
	}

	get id() { return this._task.code; }
	get name() { return this._task.name; }
	get task() { return this._task; }
	get deadline() { return this._deadline; }
	get manhour() { return this._task.manhour; }
	get schedule() { return this._schedule; }
	get isCalculated() { return this._deadline !== null && this._schedule !== null; }
	get isDisplay() { 
		console.log(`${this.name}: offset: ${this._offset}, width: ${this._width}`);
		return this._offset !== null && this._width !== null; }

	get width() { return this._width; }
	get offset() { return this._offset; }

	/**
	 * 期日を決める要因は、
	 * 		① 自身の期日
	 * 		② 親タスクの期日
	 * 		③ 後続タスクに期日に終わるために逆算した期日
	 * ② < ① が遅くなるのはOKとする
	 * ③ < ① が遅くなるのはNGなので、③を表示の期日とする
	 * 
	 * ①③ともにある場合 → ①と③で早い方を期日とする
	 * ①のみあり③がない場合 → ①を期日とする
	 * ①がなく③のみある場合 → ③を期日とする
	 * ①③ともになく②がある場合 → ②を期日とする
	 * ①②③ともにない場合 → 開始日から逆算
	 */	
	calculateDeadline(idTimeframeMap) { 
		if (this._deadline !== null) { return; }

		if (this._task.subscequences && this._task.subscequences.length > 0) {
			// 後続タスクについて計算する
			const deadlineBySubsequence = this._task.subscequences.reduce((earliest, t) => {
				let _tf = idTimeframeMap[t.code];
				_tf.calculateSchedule(idTimeframeMap);
				const tmpDeadline = moment(_tf.schedule).add(-1, "day");
				if (earliest) {
					return earliest.isBefore(tmpDeadline) ? earliest : tmpDeadline;
				} else {
					return tmpDeadline;
				}
			}, null);

			if (this._task.deadline && this._task.deadline.isBefore(deadlineBySubsequence)) {
				this._deadline = this._task.deadline.valueOf();
			} else {
				this._deadline = deadlineBySubsequence.valueOf();
			}

		} else {
			if (this._task.deadline) {
				this._deadline = this._task.deadline.valueOf();
			} else if (this._parentTimeframe) {
				this._deadline = this._parentTimeframe.deadline.valueOf();
			} else {
				this._deadline = -1;
			}
		}
	}

	/**
	 * 開始日を決める要因は、
	 * 		① 自身の開始日
	 * 		② 期日と工数で逆算した開始日
	 * 		③ 子タスクの連結で算出した開始日
	 * ②より①が遅くなるのはNGなので、②を表示の開始日とする
	 * ③より①が遅くなるのはOKとする
	 * 
	 * ①②ともにある場合 → ①と②で早い方を開始日とする
	 * ①がなく②がある場合 → ②
	 * ①②がなく③がある場合 → ③
	 * ①②③ともにない場合 → 本日を開始日とする
	 */ 
	calculateSchedule(idTimeframeMap) {
		if (this._schedule !== null) { return; }

		this.calculateDeadline(idTimeframeMap);

		console.log(this._task.schedule);

		if (this._task.schedule) {
			if (this.deadline !== -1 && this.manhour > 0) {
				const scheduleByDeadline = moment(this.deadline).add(-this.manhour, "day");
				this._schedule = scheduleByDeadline.isBefore(this._task.schedule) ? scheduleByDeadline.valueOf() : this._task.schedule.valueOf();
			} else {
				this._schedule = this._task.schedule.valueOf();
			}
		} else {
			if (this.deadline !== -1 && this.manhour > 0) {
				this._schedule = moment(this.deadline).add(-this.manhour, "day").valueOf();
			} else {
				if (this._task.tasks && this._task.tasks.length > 0) {
					// 子タスクについて計算する
					const scheduleByChildren = this._task.tasks.reduce((earliest, t) => {
						let _tf = idTimeframeMap[t.code];
						_tf.calculateSchedule(idTimeframeMap);
						const tmpSchedule = moment(_tf.schedule);
						if (earliest) {
							return earliest.isBefore(tmpSchedule) ? earliest : tmpSchedule;
						} else {
							return tmpSchedule;
						}
					}, null);

					this._schedule = scheduleByChildren.valueOf();		
				} else {
					console.log("ほあｒきてる", moment().startOf("day").format());
					this._schedule = moment().startOf("day").valueOf();
				}
			}
		}
	}

	calculateView(start, end, cellWidth) {
		if (this.deadline === -1) return;

		const schedule = moment(this.schedule);
		const deadline = moment(this.deadline);
		const offset = schedule.diff(start, "days");

		console.log(`${this.name}: offset: ${offset}`, this, start);

		if (offset <= 0) {
			if (deadline.isBefore(start)) {
				this._offset = null;
				this._width = null;
				console.log(`A-1: ${this.name}`);
			} else if (deadline.isBefore(end)) {
				this._offset = 0;
				this._width = (deadline.diff(start, "days") + 1) * cellWidth;
				console.log(`A-2: ${this.name}: offset: ${offset}, width: ${deadline.diff(start, "days")}`, deadline, start);
			} else {
				this._offset = 0;
				this._width = (end.diff(start, "days") + 1) * cellWidth;
				console.log(`A-3: ${this.name}: offset: ${offset}, width: ${this._width}`);
			}

		} else if (schedule.isBefore(end)) {
			this._offset = offset * cellWidth;
			if (deadline.isBefore(end)) {
				this._width = (deadline.diff(schedule, "days") + 1) * cellWidth;
				console.log(`B-1: ${this.name}: offset: ${offset}, width: ${this._width}`);
			} else {
				this._width = (end.diff(schedule, "days") + 1) * cellWidth;
				console.log(`B-2: ${this.name}: offset: ${offset}, width: ${this._width}`);
			}

		} else {
			this._offset = null;
			this._width = null;
			console.log(`C: ${this.name}`, schedule, end);
		}
	}
}