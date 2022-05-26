<script setup lang="ts">
import { reactive } from 'vue'
import faker from '@faker-js/faker'

const
	loading = reactive( {
		applications : true
	} ),

	columns : any = [
		{
			name : 'statementID',
			label : '#',
			field : 'statementID',
			align : 'left',

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
			align : 'right'
		}
	],

	rows : any = []

for ( let i = 1; i < 25; i++ ) {
	rows.push( {
		statementID : i,
		fullName : `${ faker.name.firstName() } ${ faker.name.lastName() } ${ faker.name.middleName() }`,
		createdAt : new Date( faker.date.past() ).toLocaleDateString(),
		phoneNumber : faker.phone.phoneNumber( '+7 (9##) ### ##-##' ),
		email : faker.internet.email()
	} )
}

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
		  :rows="rows"

		  :pagination="{ rowsPerPage : 50 }"
	  >

		<template v-slot:body-cell-statementID="props">
		  <q-td key="statementID" :props="props">
			<a :href="`applications/${props.row.statementID}`">{{ props.row.statementID }}</a>
		  </q-td>
		</template>

		<template v-slot:body-cell-actions="props">
		  <q-td key="actions" :props="props">
			<q-btn-group flat>
			  <q-btn flat round color="green-5" icon="check" size="sm" />
			  <q-btn flat round color="primary" icon="edit" size="sm" />
			  <q-btn flat round color="red-5" icon="delete" size="sm" />
			</q-btn-group>
		  </q-td>
		</template>

	  </q-table>

	</q-card-section>

  </q-card>
</template>

<style lang="scss" scoped>

.applications-form {

  width: 60%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 70%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>