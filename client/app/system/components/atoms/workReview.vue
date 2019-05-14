<template lang="pug">
	div
		strong {{ work.title }}
		.text-muted {{ work.description }}
			table
				tr(v-show="work.goodSide")
					th {{ _("GoodSideLabel") }} 
					td {{ work.goodSide }}
				tr(v-show="work.badSide")
					th {{ _("BadSideLabel") }}
					td {{ work.badSide }}
				tr(v-show="work.improvement")
					th {{ _("ImprovementLabel") }}
					td {{ work.improvement }}
</template>
<script>
	export default {
		props: {
			work : {
				type: Object
				, validator: (value) => { return true; } // TODO
				, required: true
			}
		}
	};
</script>
s