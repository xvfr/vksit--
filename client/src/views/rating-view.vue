<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/api'

const
	$q = useQuasar(),
	loading = reactive( {
		specializations : true
	} ),

	columns : any = [
		{
			name : 'position',
			label : '#',
			field : 'position',
			align : 'left',

			sortable : true
		},
		{
			name : 'firstName',
			label : 'Имя',
			field : 'firstName',
			align : 'center',

			sortable : true
		},
		{
			name : 'lastName',
			label : 'Фамилия',
			field : 'lastName',
			align : 'center',

			sortable : true
		},
		{
			name : 'middleName',
			label : 'Отчество',
			field : 'middleName',
			align : 'center',

			sortable : true
		},
		{
			name : 'averageScore',
			label : 'Средний балл',
			field : 'averageScore',
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
			name : 'isOriginal',
			label : 'Оригинал аттестата',
			field : 'isOriginal',
			align : 'right',

			sortable : true,

			format : ( value : boolean ) => value ? 'Да' : ''
		}
	],
	rows = [],

	selectedSpecialization = ref<object | null>( null ),
	specializations = ref<object[]>( [] )

;( async () => {

	try {

		const
			{ data : { groups } } = await api.get( 'groups' )

		specializations.value.push( ...groups )
		loading.specializations = false

	} catch ( e ) {

		console.error( e )
		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список специальностей',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

} )()

import faker from '@faker-js/faker/locale/ru'

for ( let i = 1; i < 30; i++ )
	rows.push( {
		position : i,
		firstName : faker.name.firstName(),
		lastName : faker.name.lastName(),
		middleName : faker.name.middleName(),
		averageScore : ( Math.random() * ( 5 - 1 ) + 1 ).toFixed( 2 ),
		createdAt : new Date( faker.date.past() ).toLocaleDateString(),
		isOriginal : Math.random() > 0.5
	} )

</script>

<template>
  <q-card square class="rating-form q-pa-md" :class="$q.screen.lt.md || 'q-my-md'">

	<div class="text-overline">
	  Рейтинг абитуриентов
	</div>

	<q-card-section>

	  <q-select
		  label="Выберите специальность"
		  v-model="selectedSpecialization"
		  :loading="loading.specializations"
		  :options="specializations"

		  option-label="name"
		  option-value="groupID"
	  />

	</q-card-section>
	<q-card-section>

	  <q-table
		  :grid="$q.screen.lt.md"
		  flat
		  :columns="columns"
		  :rows="rows"

		  table-header-class="bg-grey-2"
		  table-class="highlights"

		  :pagination="{ rowsPerPage : 25 }"
	  />

	</q-card-section>

  </q-card>
</template>

<style lang="scss" scoped>

.rating-form {

  width: 50%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 70%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

//:deep( .highlights tr:nth-child( -n+25 ) ) {
//  background-color: red;
//}

</style>