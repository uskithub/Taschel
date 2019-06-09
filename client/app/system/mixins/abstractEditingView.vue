<script>
	import Vue from "vue";
    
    import { mapActions } from "vuex";    

	import { schema as schemaUtils } from "vue-form-generator";
	import { get as objGet, cloneDeep, isArray, isFunction } from "lodash";
	
	const _ = Vue.prototype._;

	export default {
		methods : {	
            ...mapActions([
                // for Presentation
                "setWayBackOnLastCrumb"
            ])
			, validate() {
				let res = this.$refs.form.validate();
				if (!res) {
					// Set focus to first input with error
					this.$nextTick(() => {
						let el = document.querySelector("div.form tr.error input:nth-child(1)");
						if (el)
							el.focus();
					});
				}
				return res;	
			}
			, validateInClosing(isAsync = null) {
				let form = this.$refs.form;

				form.$children.forEach(child => {
					// notice: the required option not work without the validator option.
					if (child.schema.requiredInClosing) {
						child.schema._required = child.schema.required;
						child.schema.required = true;
					}
				});

				if (isAsync === null) {
					isAsync = objGet(form.options, "validateAsync", false);
				}
				form.clearValidationErrors();
				let fields = [];
				let results = [];
				form.$children.forEach(child => {
					if (isFunction(child.validate)) {
						fields.push(child); // keep track of validated children
						results.push(child.validate(true));
					}
				});
				let handleErrors = (errors) => {
					let formErrors = [];
					errors.forEach((err, i) => {
						if (isArray(err) && err.length > 0) {
							err.forEach(error => {
								formErrors.push({
									field: fields[i].schema,
									error: error,
								});
							});
						}
					});
					form.errors = formErrors;
					let isValid = formErrors.length == 0;
					form.$emit("validated", isValid, formErrors);

					form.$children.forEach(child => {
						if (child.schema.requiredInClosing) {
							child.schema.required = child.schema._required;
						}
					});

					return isAsync ? formErrors : isValid;
				};

				if(!isAsync) {
					return handleErrors(results);
				}

				return Promise.all(results).then(handleErrors);
			}
		}
		, created() {
			this.setWayBackOnLastCrumb(() => { 
                // TODO: 日次レビューは endReviewing にしているので、戻れないのでどうにかする
				this.$emit("endEditing"); 
			});
		}
	}
</script>
<style lang="scss">
	.panel {
		margin-bottom: 20px;
	}
</style>