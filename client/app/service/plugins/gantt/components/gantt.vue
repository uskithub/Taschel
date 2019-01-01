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
				, scales: createOptions(defaultOptions.scales)
				, scale: defaultOptions.scales[0].scale
				, step: defaultOptions.scales[0].steps[0]
			};
		}
		, computed : {
			...mapGetters([
				"foldingConditionMap"
			])
			// { startDate, endDate, days }
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
				return Timeframe.timeframeRowsFactory(this.treenodes);
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
