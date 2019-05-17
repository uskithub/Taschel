<template lang="pug">
	.vue-gantt
		.gantt-row
			.vue-gantt-legend
				.title
					button.button.outline(@click="$emit('addTopLevel')")
						i.icon.fa.fa-plus
						| {{ _("Add a top level task") }}
				treelist(:treenodes="treenodes", :foldingConditionMap="foldingConditionMap" ref="legend"
					@arrange="didArrangeTask"
					@editIconDidPush="editIconDidPush"
					@addIconDidPush="addIconDidPush"
					@toggleFolding="didToggleFolding"
				)
					template(v-slot:treenode="slotProps")
						slot(name="treenode", :node="slotProps.node", :parent="slotProps.parent", :isTopLevel="slotProps.isTopLevel")
			.gantt-column(@wheel.prevent="handleWheel", :style="{ width: numberOfColumns * 24 }")
				gantt-header(:rows="headerRows" @header-click="handleHeaderClick")
				gantt-body(:rows="bodyRows")
		gantt-footer(:scales="scales", :selected="selectedScaleIdx", :startDate="earliestDate", :endDate="latestDate", :step="msInCell", :period="startOfTerm"
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
		getViewportInMilliseconds,
		normalizeDate,
	} from "../../helpers";

	import GanttHeader from "../atoms/ganttHeader";
	import GanttBody from "../atoms/ganttBody";
	import GanttFooter from "../atoms/ganttFooter";
	
	import Timeframe from "../../entities/timeframe";

	import moment from "moment";
	import { cloneDeep } from "lodash";
	
	import { mapMutations, mapGetters } from "vuex";
	import store from "../../store.js";

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
			treenodes: {
				type: Array
			}
		}
		, data() {
			return {
				startOfTerm: null
				, numberOfColumns: 0
				, idTimeframeMap: (() => { return this.treenodeToIdTimeframeMapRecursively(this.treenodes); })()
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
				const _startOfTerm = this.startOfTerm !== null ? this.startOfTerm : 0;
				const { startDate, endDate } = calcViewport(_startOfTerm, this.scale, this.step, this.numberOfColumns);
				const start = moment(startDate).startOf("day");
				const end = moment(endDate).startOf("day");
				return { start, end, days: end.diff(start, "days")};
			}
			, earliestDate() {
				let _earliest = moment();

				for (let id in this.idTimeframeMap) {
					const tf = this.idTimeframeMap[id];
					if (tf.schedule !== undefined && tf.schedule !== null) {
						const m = moment(tf.schedule);
						if (m.isBefore(_earliest)) {
							_earliest = m;
						}
					}
				}
				return _earliest.add(-2, "day").valueOf();
			}
			, latestDate() {
				let _latest = moment().add(2, "month");

				for (let id in this.idTimeframeMap) {
					const tf = this.idTimeframeMap[id];
					if (tf.deadline !== undefined && tf.deadline !== null) {
						const m = moment(tf.deadline);
						if (m.isAfter(_latest)) {
							_latest = m;
						}
					}
				}
				return _latest.add(2, "day").valueOf();
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
				const { start, end, days } = this.visibleTerm;
				const _makeTimeframeRowsRecursively = (taskArr) => {
					// deadlineの遅い順に並び替え
					taskArr.sort((a, b) => -((a.deadline !== undefined || a.deadline !== null) ? moment(a.deadline) : moment("19700101", ["YYYYMMDD"]))
							.diff((b.deadline !== undefined || b.deadline !== null) ? moment(b.deadline) : moment("19700101", ["YYYYMMDD"])));

					// deadlineの遅いものから計算させる
					taskArr.forEach(task => {
						/* 期日、開始日を決める */
						this.idTimeframeMap[task.code].calculateSchedule(this.idTimeframeMap);
						this.idTimeframeMap[task.code].calculateView(start, end, defaultOptions.cellWidth);

						if (task.tasks && task.tasks.length > 0) {
							_makeTimeframeRowsRecursively(task.tasks.map(t=>t));
						}
					});
				};
				_makeTimeframeRowsRecursively(this.treenodes.map(t => t.content));

				// console.log("★★★ bodyRows", this.idTimeframeMap);

				// ツリー構造をそのままの順序になるように配列化
				// foldingMapを見て表示しないnodeは外す
				const _treeToArrayRecursively = (treenodes, arr = []) => {
					return treenodes.reduce( (arr, treenode) => {
						arr.push(treenode.id);
						if ( !(this.foldingConditionMap[treenode.id]===false) && (treenode.subtrees !== null || treenode.subtrees !== undefined) && treenode.subtrees.length > 0) {
							arr = _treeToArrayRecursively(treenode.subtrees, arr);
						}
						return arr;
					}, arr);
				};
				return _treeToArrayRecursively(this.treenodes).map(id => this.idTimeframeMap[id]);
			}
			// 以下、未整理
			, msInCell() {
				let r = getMsInScale(this.scale) * this.step;
				console.log("msInCell:", r / (60 * 60 * 24));
				return r;
			}
			, selectedScaleIdx() {
				return this.scales.findIndex(el => el === `${this.scale} ${this.step}`);
			}
		}
		, watch : {
			treenodes(newArr) {
				this.idTimeframeMap = this.treenodeToIdTimeframeMapRecursively(newArr);
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
			, treenodeToIdTimeframeMapRecursively(treenodes, parentTimeframe = null, idTimeframeMap = {}) {
				return treenodes.reduce((arr, treenode) => {
					idTimeframeMap[treenode.id] = new Timeframe(treenode.content, parentTimeframe);
					if ((treenode.subtrees !== null || treenode.subtrees !== undefined) && treenode.subtrees.length > 0) {
						idTimeframeMap = this.treenodeToIdTimeframeMapRecursively(treenode.subtrees, idTimeframeMap[treenode.id], idTimeframeMap);
					}
					return idTimeframeMap;
				}, idTimeframeMap);
			}
			, handleWheel(e) {
				if (e.deltaY > 0) {
					const newViewportStart = this.startOfTerm + this.msInCell;
					this.startOfTerm = (newViewportStart < this.latestDate) ? newViewportStart : this.latestDate;
				} else if (e.deltaY < 0) {
					const newViewportStart = this.startOfTerm - this.msInCell;
					this.startOfTerm = (newViewportStart > this.earliestDate) ? newViewportStart : this.earliestDate;
				}
			}
			// 以下、未整理
			, handleScaleChange(e) {
				const [scale, step] = e.target.value.split(' ');
				if (this.scale !== scale) this.scale = scale;
				if (this.step !== step) this.step = step;
				this.startOfTerm = normalizeDate(this.startOfTerm, this.scale, this.step);
				if (this.startOfTerm < this.earliestDate) this.startOfTerm = this.earliestDate;
				if (this.startOfTerm > this.latestDate) this.startOfTerm = this.latestDate;
			}
			, handlePeriodChange(e) {
				this.startOfTerm = parseInt(e.target.value, 10);
			}

			, handleHeaderClick({ date, scale }) {
				if (this.scales.includes(`${scale} 1`)) {
					this.scale = scale;
					this.step = 1;
					if (date > this.latestDate) this.startOfTerm = this.latestDate;
					else if (date < this.earliestDate) this.startOfTerm = this.earliestDate;
					else this.startOfTerm = date;
				}
			}
			, handleTaskClick(start) {
				const startOfTerm = normalizeDate(start, this.scale, this.step);
				this.startOfTerm = Math.min(startOfTerm, this.latestDate);
			}
			// Interfacial Operations
			, didArrangeTask({ treenode, from, to, index }) {
				this.$emit("arrange", { treenode, from, to, index });
			}
			// Task Operations
			, editIconDidPush(e, treenode) {
				this.$emit("edit", e, treenode);
			}
			, addIconDidPush(e, parent, sibling) {
				this.$emit("add", e, parent, sibling);
			}
			, didToggleFolding(e, id) {
				const newValue = (this.foldingConditionMap[id]===undefined) ? false : !this.foldingConditionMap[id];
				this.updateFoldingCondition({ id, newValue });
			}
		}
		, mounted() {
			window.addEventListener("resize", this.calculateColumns);
			this.calculateColumns();
			const maxScaleIdx = calcMaxScale(this.earliestDate, this.latestDate, this.numberOfColumns, this.scales);
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
