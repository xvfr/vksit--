<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/api'
import { useApplicationStatuses } from '@/stores/application-statuses'
import { useAuth } from '@/stores/auth'

const
	$q = useQuasar(),

	authStore = useAuth(),
	applicationStatusesStore = useApplicationStatuses(),

	loading = reactive( {
		applications : true
	} ),

	errors = reactive( {
		applications : false
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
			name : 'comment',
			label : 'Комментарий',
			field : 'comment',
			align : 'center'
		},
		{
			name : 'actions',
			label : 'Действия',
			align : 'center'
		}
	],

	abiturients = ref<object[]>( [] ),

	pagination = ref<any>( {
		sortBy : 'abiturientID',
		descending : true,
		page : 1,
		rowsPerPage : 25,
		rowsNumber : 1
	} )

const onRequest = async ( props : any ) => {

	loading.applications = true

	const
		{ page, rowsPerPage, sortBy, descending } = props.pagination,
		startRow = ( page - 1 ) * rowsPerPage

	try {

		const
			{ data : { items } } = await api.get( 'abiturients', {
				params : {
					limit : rowsPerPage,
					offset : startRow,
					orderBy : sortBy,
					descending
				}
			} )

		abiturients.value = items.map( ( e : any ) => ( {
			abiturientID : e.abiturient_id,
			fullName : e.middle_name ? `${ e.last_name } ${ e.first_name } ${ e.middle_name }` : `${ e.last_name } ${ e.first_name }`,
			createdAt : new Date( e.created_at ).toLocaleString( 'ru' ),
			phoneNumber : '+7 ' + e.phone,
			email : e.email,

			comment : e.comment,

			status : e.status_id
		} ) )

		pagination.value.page = page
		pagination.value.rowsPerPage = rowsPerPage
		pagination.value.sortBy = sortBy
		pagination.value.descending = descending

	} catch ( e ) {

		errors.applications = true

		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список заявлений',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

	loading.applications = false

}

onMounted( async () => {

	await onRequest( {
		pagination : pagination.value,
		filter : undefined
	} )

	const
		{ data : { count } } = await api( 'abiturients/count' )

	pagination.value.rowsNumber = count

	await applicationStatusesStore.get()

} )

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

		  :no-data-label="errors.applications ? 'Ошибка при получении данных' : 'Нет данных'"

		  @row-dblclick=" ( evt, row ) => $router.push( { name : 'abiturient', params : { id : row.abiturientID } } ) "

		  v-model:pagination="pagination"
		  @request="onRequest"
	  >

		<template v-slot:body-cell-abiturientID="props">
		  <q-td key="statementID" :props="props">
			<b @click="$router.push( { name : 'abiturient', params : { id : props.row.abiturientID } } )"
			   class="cursor-pointer text-overline">{{ props.row.abiturientID }}</b>
		  </q-td>
		</template>

		<template v-slot:body-cell-status="props">
		  <q-td key="status" :props="props">
			<q-circular-progress color="indigo" indeterminate
								 v-if="applicationStatusesStore.isLoading"></q-circular-progress>
			<q-badge v-else-if="!applicationStatusesStore.isError" outline align="middle"
					 :color="applicationStatusesStore.statuses.find( s => s.statusID === props.row.status )?.color">
			  {{ applicationStatusesStore.statuses.find( s => s.statusID === props.row.status )?.title }}
			</q-badge>
		  </q-td>
		</template>

		<template #body-cell-email="props">
		  <q-td key="email" :props="props">
			<a :href="`mailto:${props.row.email}`">{{ props.row.email }}</a>
		  </q-td>
		</template>

		<template #body-cell-phoneNumber="props">
		  <q-td key="phoneNumber" :props="props">
			<a :href="`tel:${props.row.phoneNumber}`">{{ props.row.phoneNumber }}</a>
		  </q-td>
		</template>

		<template #body-cell-comment="props">
		  <q-td key="comment" :props="props">
			{{ props.row.comment || '—' }}

			<!--	TODO :: add save to db	-->
			<q-popup-edit v-model="props.row.comment" auto-save v-slot="scope">
			  <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
			</q-popup-edit>
		  </q-td>
		</template>

		<template v-slot:body-cell-actions="props">
		  <q-td key="actions" :props="props">
			<q-btn-group flat>
			  <q-btn flat round color="primary" icon="edit" size="sm"
					 @click="$router.push( { name : 'abiturient', params : { id : props.row.abiturientID } } )" />
			  <q-btn flat round color="indigo-5" icon="download" size="sm" />
			  <q-btn flat round color="red-5" icon="delete" size="sm" />
			</q-btn-group>
		  </q-td>
		</template>

		<!--	card slot	-->

		<template #item="props">
		  <q-card flat>
			<q-card-section>

			  <div class="text-grey text-caption">#</div>
			  <b @click="$router.push( { name : 'abiturient', params : { id : props.row.abiturientID } } )"
				 class="cursor-pointer">{{ props.row.abiturientID }}</b>

			  <div class="text-grey text-caption q-mt-sm">Статус</div>
			  <q-circular-progress color="indigo" indeterminate
								   v-if="applicationStatusesStore.isLoading"></q-circular-progress>
			  <q-badge v-else-if="!applicationStatusesStore.isError" outline align="middle"
					   :color="applicationStatusesStore.statuses.find( s => s.statusID === props.row.status )?.color">
				{{ applicationStatusesStore.statuses.find( s => s.statusID === props.row.status )?.title }}
			  </q-badge>

			  <div class="text-grey text-caption q-mt-sm">ФИО</div>
			  <div class="text-caption">{{ props.row.fullName }}</div>

			  <div class="text-grey text-caption q-mt-sm">Дата подачи</div>
			  <div class="text-caption">{{ props.row.createdAt }}</div>

			  <div class="text-grey text-caption q-mt-sm">Номер телефона</div>
			  <div class="text-caption">{{ props.row.phoneNumber }}</div>

			  <div class="text-grey text-caption q-mt-sm">E-mail</div>
			  <div class="text-caption">{{ props.row.email }}</div>

			  <div class="text-grey text-caption q-mt-sm">Комментарий</div>
			  <div class="text-caption">
				{{ props.row.comment || '—' }}

				<!--	TODO :: add save to db	-->
				<q-popup-edit v-model="props.row.comment" auto-save v-slot="scope">
				  <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
				</q-popup-edit>
			  </div>

			  <div class="text-grey text-caption q-mt-sm">Действия</div>
			  <div class="text-caption">
				<q-btn-group flat>
				  <q-btn flat round color="primary" icon="edit" size="sm"
						 @click="$router.push( { name : 'abiturient', params : { id : props.row.abiturientID } } )" />
				  <q-btn flat round color="indigo-5" icon="download" size="sm" />
				  <q-btn flat round color="red-5" icon="delete" size="sm" />
				</q-btn-group>
			  </div>

			</q-card-section>
		  </q-card>
		</template>

	  </q-table>

	</q-card-section>

	<router-view />

  </q-card>

</template>

<style lang="scss" scoped>

.applications-form {

  min-width: 70%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 85%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>