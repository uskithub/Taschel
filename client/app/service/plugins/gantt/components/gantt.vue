<template lang="pug">
	.vue-gantt
		.gantt-row
			.vue-gantt-legend
				.title(:title="legendHelp") 
					button.button.outline(@click="$emit('addTopLevel')")
						i.icon.fa.fa-plus
						| {{ _("Add a top level task") }}
				treelist(:treenodes="treenodes", :foldingConditionMap="foldingConditionMap" ref="legend"
					@arrange="didArrangeTask"
					@editIconDidPush="editIconDidPush"
					@addIconDidPush="addIconDidPush"
					@toggleFolding="didToggleFolding"
				)
			.gantt-column(@wheel.prevent="handleWheel", :style="{ width: numberOfColumns * 24 }")
				gantt-header(:rows="headerRows" @header-click="handleHeaderClick")
				gantt-body(:rows="bodyRows", :foldingConditionMap="foldingConditionMap")
		gantt-footer(:scales="scales", :selected="selectedScaleIdx", :startDate="min", :endDate="max", :step="msInCell", :period="startOfTerm"
			@scale-change="handleScaleChange"
			@period-change="handlePeriodChange"
		)
</template>

<script>
	import Vue from "vue";
	import {
		calcHeader,
		calcMaxScale,
		calcViewport,
		createOptions,
		getEndOfScale,
		getMsInScale,
		getMinDate,
		getMaxDate,
		getViewportInMilliseconds,
		normalizeDate,
		transformInputValues,
	} from "../helpers";
	import GanttHeader from "./ganttHeader";
	import GanttBody from "./ganttBody";
	import GanttFooter from "./ganttFooter";
	
	import Timeframe from "../timeframe.js";

	import moment from "moment";
	import { cloneDeep } from "lodash";
	
	import { mapMutations, mapGetters } from "vuex";
	import store from "../store.js";

	const defaultOptions = {
		cellWidth: 24
		, scales: [
			{ scale: 'days', steps: [1] }
			, { scale: 'months', steps: [1] }
			// , { scale: 'hours', steps: [12, 8, 6, 3, 1] }
			// , { scale: 'minutes', steps: [30, 15, 5, 1] }
			// , { scale: 'seconds', steps: [30, 15, 5, 1] }
		]
	};

	export default {
		store
		, components: {
			GanttHeader
			, GanttBody
			, GanttFooter
		}
		, props: {
			data: {
				type: Object
				, required: true
			}
			, treenodes: {
				type: Array
			}
		}
		, data() {
			return {
				startOfTerm: null
				, numberOfColumns: 0
				, idTimeframeMap: this.treenodeToIdTimeframeMapRecursively(this.treenodes)
				// 以下、未整理
				, scales: createOptions(defaultOptions.scales)
				, scale: defaultOptions.scales[0].scale
				, step: defaultOptions.scales[0].steps[0]
			};
		}
		, computed : {
			...mapGetters([
				"foldingConditionMap"
			])
			// { start, end, days }
			, visibleTerm() {
				const _startOfTerm = this.startOfTerm !== null ? this.startOfTerm.valueOf() : 0;
				const { startDate, endDate } = calcViewport(_startOfTerm, this.scale, this.step, this.numberOfColumns);
				const start = moment(startDate);
				const end = moment(endDate);
				return { start, end, days: end.diff(start, "days")};
			}
			, earliestDate() {
				let _earliest = moment();

				// TODO: treenodeをなめて比べる
				return _earliest;
			}
			, latestDate() {
				let _latest = moment().add(2, "month");

				// TODO: treenodeをなめて比べる
				return _latest;
			}
			, headerRows() {
				let _headers = [];
				const { start, end, days } = this.visibleTerm;
				
				// year header
				const sy = start.year();
				const ey = end.year();
				let yCols = 0;
				
				let yColumns = [];
				let mColumns = [];
				let dColumns = [];

				do {
					const _yStart = (yCols === 0) ? start : moment(start).add(yCols, "year").startOf("year");
					const _yEnd = (sy + yCols < ey) ? moment(start).add(yCols, "year").endOf("year") : end;
					const _yDays = _yEnd.diff(_yStart, "days") + 1;

					yColumns.push({
						label: `${sy + yCols} 年`
						, title: `y:${sy + yCols}`
						, start: _yStart
						, end: _yEnd
						, days: _yDays
						, width: defaultOptions.cellWidth * _yDays
					});

					// month header
					const sm = _yStart.month();
					const em = _yEnd.month();
					let mCols = 0;

					do {
						const _mStart = (mCols === 0) ? _yStart : moment(_yStart).add(mCols, "month").startOf("month");
						const _mEnd = (sm + mCols < em) ? moment(_yStart).add(mCols, "month").endOf("month") : _yEnd;
						const _mDays = _mEnd.diff(_mStart, "days") + 1;

						mColumns.push({
							label: `${sm + mCols + 1} 月`
							, title: `y:${sy + yCols}_m:${sm + mCols + 1}`
							, start: _mStart
							, end: _mEnd
							, days: _mDays
							, width: defaultOptions.cellWidth * _mDays
						});

						// day header
						const sd = _mStart.date();
						const ed = _mEnd.date();
						let dCols = 0;

						do {
							const _day = (dCols === 0) ? _mStart : moment(_mStart).add(dCols, "day");

							dColumns.push({
								label: `${sd + dCols}`
								, title: `y:${sy + yCols}_m:${sm + mCols}_d:${sd + dCols}`
								, start: _day
								, end: _day
								, days: 1
								, width: defaultOptions.cellWidth
							});

							dCols += 1; 
						} while ( sd + dCols <= ed);

						mCols += 1; 
					} while ( sm + mCols <= em);

					yCols += 1; 
				} while ( sy + yCols <= ey);
				
				_headers.push(yColumns);
				_headers.push(mColumns);
				_headers.push(dColumns);

				return _headers;				
			}
			, bodyRows() {
				/**
				 * ● 期日について
				 * 期日を決める要因は、
				 * 		① 自身の期日
				 * 		② 親タスクの期日
				 * 		③ 後続タスクに期日に終わるために逆算した期日
				 * ②より①が遅くなるのはOKとする
				 * ③より①が遅くなるのはNGなので、③を表示の期日とする
				 * 
				 * ①③ともにある場合 → ①と③で早い方を期日とする
				 * ①のみあり③がない場合 → ①を期日とする
				 * ①がなく③のみある場合 → ③を期日とする
				 * ①③ともになく②がある場合 → ②を期日とする
				 * ①②③ともにない場合 → 開始日から逆算
				 * 	
				 * ● 工数について
				 * 工数は「自身の工数」を使う
				 * 
				 * ● 開始日について
				 * 開始日を決める要因は、
				 * 		① 自身の開始日
				 * 		② 期日と工数で逆算した開始日
				 * 		③ 子タスクの連結で算出した開始日
				 * ②より①が遅くなるのはNGなので、②を表示の開始日とする
				 * ③より①が遅くなるのはOKとする
				 * 
				 * ①②ともにある場合 → ①と②で早い方を開始日とする
				 * ①②③ともにない場合 → 本日を開始日とする
				 */ 
				const { start, end, days } = this.visibleTerm;



				const _decideDeadlineBySubsequenceRecursively = (task) => {
					let _deadline = null;

					task.subscequences.reduce(arr, task => {
						if (_idTimeframeMap[task.code].isCalculated) { return _idTimeframeMap[task.code]; }
						
						// TODO
						
					}, []);
					
					return _deadline;
				};

				const _makeTimeframeRowsRecursively = (taskArr, parentDeadline = null) => {
					// deadlineの遅い順に並び替え
					taskArr.sort((a, b) => -(a.deadline || moment("19700101", ["YYYYMMDD"])).diff(b.deadline || moment("19700101", ["YYYYMMDD"])));

					if (parentDeadline === null) {
						// 親のdeadlineがない場合、子の中で一番遅い兄弟のdeadlineを基準deadlineにする
						parentDeadline = taskArr[0].deadline.valueOf();
					}

					taskArr.forEach(task => {
						if (_idTimeframeMap[task.code].isCalculated) { return; }

						let _deadline = null;
						let _manhour = null;
						let _schedule = null;

						/* 期日を決める */
						// 自身が期日をもつ場合、かつsubsequencesのない場合、それが期日となる
						// 自身が期日をもつ場合、かつsubsequencesのある場合、subsequencesのうち、一番scheduleの早いものがdeadlineと自身の期日の早い方が期日となる
						// 自身が期日を持たない場合、かつsubsequencesのない場合、親の期日が期日となる
						// 自身が期日を持たない場合、かつsubsequencesのある場合、subsequencesのうち、一番scheduleの早いものがdeadlineとなる
						if ((task.subscequences !== null || task.subscequences !== undefined) && task.subscequences.length > 0) {
							_deadline = _decideDeadlineBySubsequenceRecursively(task);
						} else {
							_deadline = task.deadline ? task.deadline.valueOf() : parentDeadline;
						}

						/* 工数を決める */
						// 自身が工数をもつ場合、かつchildrenのない場合、それが工数となる
						// 自身が工数をもつ場合、かつchildrenのある場合、それらを連結したものが工数と自身の工数の長い方を工数とする
						// 自身が工数を持たない場合、かつchildrenがない場合、1dayとする
						// 自身が工数を持たない場合、かつchildrenのある場合、それらを連結したものが工数となる
						if ((task.children !== null || task.children !== undefined) && task.children.length > 0) {
							const _childTimeframes = _makeTimeframeRowsRecursively(task.children, _deadline);
							_childTimeframes.sort((a, b) => a.schedule.diff(b.schedule));
							let _beginning = moment(_childTimeframes[0].schedule);
							_manhour = _beginning.diff(moment(_deadline), "days");
							if (task.manhour && task.manhour > _manhour) { _manhour = task.manhour; }
							
						} else {
							// 子がないので自信の工数あるいはデフォルトの1が工数となる
							_manhour = task._manhour ? task._manhour : 1;
						}

						/* 開始日を決める */
						// 自身が開始日をもつ場合、期日から工数を差し引いた日と自身の開始日の早い方を開始日とする
						// 自身が開始日を持たない場合、期日から工数を差し引いた日を開始日とする
						_schedule = moment(_deadline).add(-_manhour, "day");
						if (task.schedule && task.schedule.isBefore(_schedule)) { _schedule = moment(task.schedule); }

						let _timeframe = _childTimeframes[task.id];
						_timeframe.deadline = moment(_deadline);
						_timeframe.manhour = _manhour;
						_timeframe.schedule = _schedule;
						_timeframe.isCalculated = true;
					});
				};
				_makeTimeframeRowsRecursively(this.treenodes.map(t => t.task));

				console.log("******", this.idTimeframeMap);

				// ツリー構造をそのままの順序になるように配列化
				const _treeToArrayRecursively = (treenodes, arr = []) => {
					return treenodes.reduce( (arr, treenode) => {
						arr.push(treenode.id);
						if ((treenode.subtree !== null || treenode.subtree !== undefined) && treenode.subtree.length > 0) {
							arr = _treeToArrayRecursively(treenode.subtree, arr);
						}
						return arr;
					}, arr);
				};
				return _treeToArrayRecursively(this.treenodes).map(id => this.idTimeframeMap[id]);
			}
			// 以下、未整理
			, parsedProps() {
				const { rows } = this.data;
				return transformInputValues(rows);
			}
			, legendHelp() {
				return this.data.legendHelp;
			}
			, startDate() {
				return this.parsedProps.startDate;
			}
			, endDate() {
				return this.parsedProps.endDate;
			}
			, values() {
				return this.parsedProps.values.map(value => value.sort((a, b) => a.from - b.from));
			}
			, tasks() {
				return this.parsedProps.tasks;
			}
			, max() {
				return getMaxDate(
					getEndOfScale(this.scale, this.endDate)
					- getViewportInMilliseconds(this.endDate, this.scale, this.step, this.numberOfColumns),
					this.min, this.msInCell,
				);
			}
			, min() {
				let r = getMinDate(this.startDate, this.scale);
				console.log("min:", r, moment(r));
				return r;
			}
			, msInCell() {
				return getMsInScale(this.scale) * this.step;
			}
			, selectedScaleIdx() {
				return this.scales.findIndex(el => el === `${this.scale} ${this.step}`);
			}
		}
		, methods: {
			...mapMutations([
				"updateFoldingCondition"
			])
			// for Presentation
			, calculateColumns() {
				this.numberOfColumns = Math.ceil((this.$el.clientWidth - this.$refs.legend.$el.clientWidth) / defaultOptions.cellWidth);
			}
			, treenodeToIdTimeframeMapRecursively = (treenodes, parentTimeframe = null, idTimeframeMap = {}) => {
				return treenodes.reduce((arr, treenode) => {
					idTimeframeMap[treenode.id] = new Timeframe(treenode.task, parentTimeframe);
					if ((treenode.subtree !== null || treenode.subtree !== undefined) && treenode.subtree.length > 0) {
						idTimeframeMap = this.treenodeToIdTimeframeMapRecursively(treenode.subtree, idTimeframeMap[treenode.id], idTimeframeMap);
					}
					return idTimeframeMap;
				}, idTimeframeMap);
			}
			// 以下、未整理
			, handleScaleChange(e) {
				const [scale, step] = e.target.value.split(' ');
				if (this.scale !== scale) this.scale = scale;
				if (this.step !== step) this.step = step;
				this.startOfTerm = normalizeDate(this.startOfTerm, this.scale, this.step);
				if (this.startOfTerm < this.min) this.startOfTerm = this.min;
				if (this.startOfTerm > this.max) this.startOfTerm = this.max;
			}
			, handlePeriodChange(e) {
				this.startOfTerm = parseInt(e.target.value, 10);
			}
			, handleWheel(e) {
				const newViewportStart = e.deltaY > 0
					? this.startOfTerm + this.msInCell
					: this.startOfTerm - this.msInCell;
				if (e.deltaY > 0) {
					if (newViewportStart < this.max) {
					this.startOfTerm = newViewportStart;
					} else {
					this.startOfTerm = this.max;
					}
				} else if (e.deltaY < 0) {
					if (newViewportStart > this.min) {
					this.startOfTerm = newViewportStart;
					} else {
					this.startOfTerm = this.min;
					}
				}
			}
			, handleHeaderClick({ date, scale }) {
				if (this.scales.includes(`${scale} 1`)) {
					this.scale = scale;
					this.step = 1;
					if (date > this.max) this.startOfTerm = this.max;
					else if (date < this.min) this.startOfTerm = this.min;
					else this.startOfTerm = date;
				}
			}
			, handleTaskClick(start) {
				const startOfTerm = normalizeDate(start, this.scale, this.step);
				this.startOfTerm = Math.min(startOfTerm, this.max);
			}
			// Interfacial Operations
			, didArrangeTask({ treenode, from, to, index }) {
				this.$emit("arrange", { treenode, from, to, index });
			}
			// Task Operations
			, editIconDidPush(e, treenode) {
				this.$emit("edit", e, treenode);
			}
			, addIconDidPush(e, treenode) {
				this.$emit("add", e, treenode);
			}
			, didToggleFolding(e, id) {
				const newValue = (this.foldingConditionMap[id]===undefined) ? false : !this.foldingConditionMap[id];
				this.updateFoldingCondition({ id, newValue });
			}
		}
		, mounted() {
			window.addEventListener("resize", this.calculateColumns);
			this.calculateColumns();
			const maxScaleIdx = calcMaxScale(this.startDate, this.endDate, this.numberOfColumns, this.scales);
			const [scale, step] = this.scales[maxScaleIdx].split(' ');
			this.scale = scale;
			this.step = step;
			this.scales = this.scales.filter((_, idx) => idx >= maxScaleIdx);
			this.startOfTerm = this.earliestDate;
		}
		, beforeDestroy() {
			window.removeEventListener("resize", this.calculateColumns);
		}
	};
</script>
<style lang="scss">
	@import "../assets/style";
</style>
<style lang="scss" scoped>
</style>
