<script setup lang="ts">

const
	columns : any = [
		{
			name : 'identification',
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

	rows = [
		{
			statementID : 2434,
			fullName : 'Офыовлфывофлыв Вфлывдфывл ВЛЛдфывлфдывдл',
			createdAt : '23.04.2012',
			phoneNumber : '+7 900 400 99-00',
			email : 'dkkddkkk@mail.ru'
		},
		{
			statementID : 2435,
			fullName : 'Офыовлфывофлыв Вфлывдфывл ВЛЛдфывлфдывдл',
			createdAt : '23.04.2012',
			phoneNumber : '+7 900 400 99-00',
			email : 'dkkddkkk@mail.ru'
		},
		{
			statementID : 2437,
			fullName : 'Офыовлфывофлыв Вфлывдфывл ВЛЛдфывлфдывдл',
			createdAt : '23.04.2012',
			phoneNumber : '+7 900 400 99-00',
			email : 'dkkddkkk@mail.ru'
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

		  :pagination="{ rowsPerPage : 25 }"
	  >
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