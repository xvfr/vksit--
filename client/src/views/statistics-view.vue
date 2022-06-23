<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useGroups } from '@/stores/groups'
import { useQuasar } from 'quasar'
import api from '@/api'

const
	$q = useQuasar(),
	groupsStore = useGroups(),

	loading = reactive( {
		statistics : true
	} ),

	columns = ref<any[]>( [
		{
			name : 'group',
			label : 'Специальность',
			field : 'group',
			align : 'left',
			sortable : true,

			format : ( val : { name : string } ) => val.name,

			sort : ( a : any, b : any ) => a.name.localeCompare( b.name )
		},
		{
			name : 'lastWeek',
			label : '',
			field : 'lastWeek',

			align : 'center',

			sortable : true
		},
		{
			name : 'monday',
			label : '',
			field : 'monday',

			align : 'center',

			sortable : true
		},
		{
			name : 'tuesday',
			label : '',
			field : 'tuesday',

			align : 'center',

			sortable : true
		},
		{
			name : 'wednesday',
			label : '',
			field : 'wednesday',

			align : 'center',

			sortable : true
		},
		{
			name : 'thursday',
			label : '',
			field : 'thursday',

			align : 'center',

			sortable : true
		},
		{
			name : 'friday',
			label : '',
			field : 'friday',

			align : 'center',

			sortable : true
		},
		{
			name : 'saturday',
			label : '',
			field : 'saturday',

			align : 'center',

			sortable : true
		},
		{
			name : 'sunday',
			label : '',
			field : 'sunday',

			align : 'center',

			sortable : true
		}
	] ),

	statistics = ref<{ group : { name : string, groupID : number, shortName : string, isPaid : boolean }, lastWeek : number, monday : number, tuesday : number, wednesday : number, thursday : number, friday : number, saturday : number, sunday : number }[]>( [] )

onMounted( async () => {

	statistics.value = groupsStore.groups.map( g => ( {
		group : g,

		lastWeek : 0,

		monday : 0,
		tuesday : 0,
		wednesday : 0,
		thursday : 0,
		friday : 0,
		saturday : 0,
		sunday : 0
	} ) )

	try {

		const { data : { items } } = await api( 'statistics' )

		let index = 1
		for ( const { field, label, data } of items ) {

			columns.value[ index ].label = label

			for ( const { group_id, count } of data ) {

				const
					group = statistics.value.find( s => s.group.groupID == group_id )

				if ( group )
					group[ field as 'lastWeek' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' ] = count

			}

			index++
		}

	} catch ( e ) {

		console.error( e )

		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить статистику',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

	loading.statistics = false

} )

</script>

<template>

  <q-table
	  :class="$q.screen.lt.md || 'q-my-md'"

	  square
	  flat
	  bordered
	  :columns="columns"
	  :rows="statistics"

	  separator="vertical"
	  table-header-class="bg-indigo-1"

	  :loading="loading.statistics"

	  hide-pagination
	  :pagination="{ rowsPerPage : 0 }"
  />

</template>