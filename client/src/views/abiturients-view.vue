<script setup lang="ts">
import { provide, reactive, ref } from 'vue'
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

	specializations = ref<object[]>( [] )

provide( 'specializations', specializations )

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
				email : e.email,

				comment : e.comment,

				status : {
					id : e.status_id,
					title : e.title,
					color : e.color
				}
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

	// groups

	try {

		const
			{ data : { items } } = await api.get( 'groups' ),

			groups = items.map( ( e : any ) => ( {
				groupID : e.group_id,
				name : e.name,
				shortName : e.short_name,
				isPaid : e.is_paid
			} ) )

		specializations.value.push( ...groups )

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
			<b @click="$router.push( { name : 'abiturient', params : { id : props.row.abiturientID } } )"
			   class="cursor-pointer text-overline">{{ props.row.abiturientID }}</b>
		  </q-td>
		</template>

		<template v-slot:body-cell-status="props">
		  <q-td key="status" :props="props">
			<q-badge outline align="middle" :color="props.row.status.color">
			  {{ props.row.status.title }}
			</q-badge>
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