<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/api'

const
	$q = useQuasar(),
	loading = reactive( {
		applications : true
	} ),

	columns : any = [
		{
			name : 'abiturientID',
			label : '#',
			field : 'abiturientID',
			align : 'left',

			sortable : true
		},
		{
			name : 'status',
			label : 'Статус',
			align : 'center',

			sortable : true
		},
		{
			name : 'fullName',
			label : 'ФИО',
			field : 'fullName',
			align : 'center',

			sortable : true
		},
		{
			name : 'createdAt',
			label : 'Дата подачи заявления',
			field : 'createdAt',
			align : 'center',

			sortable : true
		},
		{
			name : 'phoneNumber',
			label : 'Номер телефона',
			field : 'phoneNumber',
			align : 'center'
		},
		{
			name : 'email',
			label : 'E-mail',
			field : 'email',
			align : 'center'
		},
		{
			name : 'actions',
			label : 'Действия',
			align : 'center'
		}
	],

	abiturients = ref<object[]>( [] )

;( async () => {

	try {

		const
			{ data : { items } } = await api.get( 'abiturients' )

		const
			formattedAbiturients = items.map( ( e : any ) => ( {
				abiturientID : e.abiturient_id,
				fullName : `${ e.last_name } ${ e.first_name } ${ e.middle_name }`,
				createdAt : new Date().toLocaleDateString(),
				phoneNumber : e.phone,
				email : e.email
			} ) )

		abiturients.value.push( ...formattedAbiturients )
		loading.applications = false

	} catch ( e ) {

		console.error( e )
		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список заявлений',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

} )()

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
		  :loading="loading.applications"
		  :grid="$q.screen.lt.md"
		  flat
		  separator="cell"
		  table-header-class="bg-grey-2"
		  :columns="columns"
		  :rows="abiturients"

		  :pagination="{ rowsPerPage : 50 }"
	  >

		<template v-slot:body-cell-abiturientID="props">
		  <q-td key="statementID" :props="props">
			<!--	TODO :: customize link	or router-link use	-->
			<a href="#" @click="$router.push( { name : 'abiturient', params : { id : props.row.abiturientID } } )"
			   class="cursor-pointer">{{ props.row.abiturientID }}</a>
		  </q-td>
		</template>

		<template v-slot:body-cell-status="props">
		  <q-td key="status" :props="props">
			<q-badge outline align="middle" color="warning">
			  На рассмотрении
			</q-badge>
		  </q-td>
		</template>

		<template v-slot:body-cell-actions="props">
		  <q-td key="actions" :props="props">
			<q-btn-group flat>
			  <q-btn flat round color="primary" icon="edit" size="sm" />
			  <q-btn flat round color="red-5" icon="delete" size="sm" />
			</q-btn-group>
		  </q-td>
		</template>

	  </q-table>

	</q-card-section>

	<router-view />

  </q-card>
</template>

<style lang="scss" scoped>

.applications-form {

  width: 60%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 85%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>