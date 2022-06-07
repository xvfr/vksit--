<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import faker from '@faker-js/faker/locale/ru'
import { useGroups } from '@/stores/groups'

const
	$q = useQuasar(),

	groupsStore = useGroups(),

	loading = reactive( {
		rating : true
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
			name : 'isOriginal',
			label : 'Оригинал аттестата',
			field : 'isOriginal',
			align : 'right',

			sortable : true,

			format : ( value : boolean ) => value ? 'Оригинал' : 'Копия'
		}
	],
	rows : any = [],

	// TODO :: change any type
	selectedSpecialization = ref<any | null>( localStorage.ratingSpecialization ? JSON.parse( localStorage.ratingSpecialization ) : null )

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

watch( selectedSpecialization, spec => spec ? localStorage.ratingSpecialization = JSON.stringify( spec ) : delete localStorage.ratingSpecialization )

</script>

<template>
  <q-card square class="rating-form q-pa-md" :class="$q.screen.lt.md || 'q-my-md'">

	<div class="text-overline">
	  Рейтинг абитуриентов
	</div>

	<q-card-section>

	  <!--		TODO :: search lastname		-->
	  <!--		TODO :: subscribe			-->

	  <q-select
		  v-model="selectedSpecialization"

		  label="Выберите специальность"
		  :loading="groupsStore.isLoading"
		  :options="groupsStore.groups"
		  :disable="groupsStore.isLoading || groupsStore.isError"
		  :error="groupsStore.isError"
		  error-message="Не удалось загрузить список специальностей"

		  option-label="name"
		  option-value="groupID"
	  />

	  <!--	TODO :: save selected group to localstorage and route  -->

	</q-card-section>
	<q-card-section v-if="selectedSpecialization">

	  <q-table
		  :grid="$q.screen.lt.md"
		  flat
		  :columns="columns"
		  :rows="rows"
		  separator="vertical"
		  :loading="loading.rating"

		  table-header-class="bg-indigo-1"
		  :table-class=" selectedSpecialization?.isPaid ? 'highlights-5' : 'highlights-25' "

		  :pagination="{ rowsPerPage : 50, sortBy : 'isOriginal', descending : true }"
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

:deep( .rating tr:nth-child(2n) ) {
  background-color: #f5f5f5;
}

:deep( .highlights-25 ) {

  & tr:nth-child( 25 ) td {
    border-bottom: 1px dashed indigo;
  }

}

:deep( .highlights-5 ) {

  & tr:nth-child( 5 ) td {
    border-bottom: 1px dashed indigo;
  }

}

</style>