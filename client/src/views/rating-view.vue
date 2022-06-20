<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useGroups } from '@/stores/groups'
import api from '@/api'

const
	$q = useQuasar(),

	groupsStore = useGroups(),

	loading = reactive( {
		rating : true
	} ),

	columns : any[] = [
		{
			name : 'abiturientID',
			label : '#',
			field : 'abiturientID',
			align : 'left',

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
			name : 'firstName',
			label : 'Имя',
			field : 'firstName',
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

			sortable : true,

			format : ( value : number ) => value.toFixed( 2 )
		},
		{
			name : 'isOriginal',
			label : 'Оригинал аттестата',
			field : 'isOriginal',
			align : 'center',

			sortable : true,

			format : ( value : boolean ) => value ? 'Оригинал' : 'Копия'
		}
	],

	rating = ref<{ abiturientID : number, firstName : string, lastName : string, middleName : string, averageScore : number, isOriginal : boolean }[]>( [] ),

	pagination = ref<{ sortBy : string, descending : boolean, page : number, rowsPerPage : number, rowsNumber : number }>( {
		sortBy : localStorage.ratingSortBy || 'isOriginal',
		descending : localStorage.descending === 'true' || false,
		page : 1,
		rowsPerPage : 50,
		rowsNumber : 1
	} ),

	selectedSpecialization = ref<{ groupID : number, name : string, shortName : string, isPaid : boolean } | null>( localStorage.ratingSpecialization ? JSON.parse( localStorage.ratingSpecialization ) : null )

watch( () => pagination.value.sortBy, ( sortBy ) => sortBy ? localStorage.ratingSortBy = sortBy : delete localStorage.ratingSortBy )
watch( () => pagination.value.descending, ( descending ) => descending ? localStorage.descending = descending : delete localStorage.descending )

watch( selectedSpecialization, spec => {

	if ( spec ) {

		onRequest( {
			pagination : pagination.value,
			filter : undefined
		} )

		localStorage.ratingSpecialization = JSON.stringify( spec )

	} else
		delete localStorage.ratingSpecialization
} )

const onRequest = async ( props : any ) => {

	loading.rating = true

	const
		{ page, rowsPerPage, sortBy, descending } = props.pagination,
		startRow = ( page - 1 ) * rowsPerPage

	try {

		const
			{ data : { items } } = await api.get( `rating/${ selectedSpecialization.value?.groupID }`, {
				params : {
					limit : rowsPerPage,
					offset : startRow,
					orderBy : sortBy,
					descending
				}
			} )

		rating.value = items.map( ( e : any ) => ( {
			abiturientID : e.abiturient_id,
			firstName : e.first_name,
			lastName : e.last_name,
			middleName : e.middle_name,
			averageScore : e.average_score,
			isOriginal : !!e.original_certificate
		} ) )

		pagination.value.page = page
		pagination.value.rowsPerPage = rowsPerPage
		pagination.value.sortBy = sortBy
		pagination.value.descending = descending

	} catch ( e ) {

		console.error( e )

		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список рейтинг',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

	loading.rating = false

}

onMounted( async () => {

	if ( selectedSpecialization.value ) {

		await onRequest( {
			pagination : pagination.value,
			filter : undefined
		} )

		const
			{ data : { count } } = await api( `rating/${ selectedSpecialization.value.groupID }/count` )

		pagination.value.rowsNumber = count

	}

} )

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
		  no-error-icon
		  :loading="groupsStore.isLoading"
		  :options="groupsStore.groups"
		  :disable="groupsStore.isLoading || groupsStore.isError"
		  :error="groupsStore.isError"
		  error-message="Не удалось загрузить список специальностей"

		  behavior="dialog"

		  clearable
		  clear-icon="clear"

		  option-label="name"
		  option-value="groupID"
	  />

	  <!--	TODO ::: add mobile sort  -->

	  <q-table
		  v-if="selectedSpecialization"

		  :grid="$q.screen.lt.md"
		  flat
		  :columns="columns"
		  :rows="rating"
		  separator="vertical"
		  :loading="loading.rating"

		  table-header-class="bg-indigo-1"
		  :table-class=" selectedSpecialization?.isPaid ? 'highlights-5' : 'highlights-25' "

		  @request="onRequest"
		  v-model:pagination="pagination"
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