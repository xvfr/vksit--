<script setup lang="ts">

const
	columns = [
		{
			name : 'group',
			label : 'Специальность',
			field : 'group',
			align : 'left',
			sortable : true
		},
		{
			name : 'lastWeek',
			label : '6/6/2022 - 12/6/2022',
			field : 'lastWeek',
			sortable : true
		},
		{
			name : 'monday',
			label : '13/6/2022',
			field : 'monday',
			sortable : true
		},
		{
			name : 'tuesday',
			label : '14/6/2022',
			field : 'tuesday',
			sortable : true
		},
		{
			name : 'wednesday',
			label : '15/6/2022',
			field : 'wednesday',
			sortable : true
		},
		{
			name : 'thursday',
			label : '16/6/2022',
			field : 'thursday',
			sortable : true
		},
		{
			name : 'friday',
			label : '17/6/2022',
			field : 'friday',
			sortable : true
		},
		{
			name : 'saturday',
			label : '18/6/2022',
			field : 'saturday',
			sortable : true
		},
		{
			name : 'sunday',
			label : '19/6/2022',
			field : 'sunday',
			sortable : true
		}
	] as any

// TODO :: change any type

</script>

<template>

  <q-table
	  square
	  flat
	  bordered
	  :columns="columns"
  />

</template>