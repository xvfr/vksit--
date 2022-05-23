<script setup lang="ts">

const
	columns : object[] = [
		{
			name : 'identification',
			label : '#',
			field : 'position',
			align : 'left',

			sortable : true
		},
		{
			name : 'fullName',
			label : 'ФИО',
			field : 'fullName',
			align : 'center',

			sortable : true
		}
	]

</script>

<template>
  <q-card square class="applications-form q-pa-md" :class="$q.screen.lt.md || 'q-my-md'">

	<div class="text-overline">
	  Список заявлений
	</div>

	<div class="text-caption text-grey">
	  Список абитуриентов подавших заявления
	</div>

	<q-card-section>

	  <q-table
		  :grid="$q.screen.lt.md"
		  flat
		  table-header-class="bg-grey-2"
		  :columns="columns"
		  :rows="rows"
	  />

	</q-card-section>

  </q-card>
</template>

<style lang="scss" scoped>

.applications-form {

  width: 50%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 70%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>