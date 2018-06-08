<!-- // DDD: Presentation -->
<template lang="pug">
	.container
		.taskPicker
		.matrix
</template>

<script>
	import Vue from "vue";
	import Base from "../../fundamentals/mixins/base";
	import Task from "../../fundamentals/entities/task";
	// import schema from "./schema";
	import { mapGetters, mapActions } from "vuex";
	const _ = Vue.prototype._;

	// schema.table.columns = Task.createTableSchema(schema.table.columns);
	// schema.form.fields = Task.createFormSchema(schema.form.fields);
	
	export default {
		name : "Weekly"
		, mixins : [ Base ]
		, components : {
		}
		, computed : {
			...mapGetters([
				"tasks"
				, "currentWeek"
			])
		}
		, data() {
			return {
				isEditing: false
				, entity: null
				// , tableSchema : schema.table
				// , formSchema : schema.form
				, order : {}
				, options: {}
			};
		}
		, methods : {
			...mapActions([
				// Usecases
				"getMyTaskList"
			])
			// usecase: a user selects a task for editing.
			, didSelectRow(entity) {
				this.entity = entity;
				this.isEditing = true;
			}
			, didPushAddButton() {
				this.isEditing = true;
			}
			, didReceiveCloseEvent() {
				this.isEditing = false;
				this.popCrumb();
				this.$nextTick(() => {
					this.entity = null;
				});
			}
		}
		, created() {

			this.setSelectorOnLastCrumb({ 
				items:[
					{ id: "hoge1", name: "ajgoi;reagoi;" }
					, { id: "hoge2", name: "vf,l;geajg" }
					, { id: "hoge3", name: "vfald;gjejgo" }
				]
				, itemDidPush: (item) => { 
					console.log(item);
				}
			});
			this.pushCrumb({ id: "week", name: this.currentWeek });
		}
		, sessionEnsured(me) {
			this.getMyTaskList();
		}
	};
</script>

<style lang="scss" scoped>

	.container {
		display: flex;

		.taskPicker {
			flex-grow: 1;
			background: rgba(black, 0.2);
		}

		.matrix {
			flex-grow: 2;
		}
	}
</style>
