<script setup lang="ts">

const
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
	rows = [
		{
			position : 1,
			firstName : 'Иванов',
			lastName : 'Иван',
			middleName : 'иванович',
			averageScore : 4.35,
			createdAt : '24.07.2022',
			isOriginal : false
		},
		{
			position : 2,
			firstName : 'Иванов',
			lastName : 'Ив123123ан',
			middleName : 'иванович',
			averageScore : 4.55,
			createdAt : '25.07.2022',
			isOriginal : true
		},
		{
			position : 3,
			firstName : 'Dasdadasd',
			lastName : 'Ив123123ан',
			middleName : 'иванович',
			averageScore : 4.55,
			createdAt : '25.07.2022',
			isOriginal : false
		}
	]

</script>

<template>
  <q-card square class="rating-form q-pa-md">

	<div class="text-overline">
	  Рейтинг абитуриентов
	</div>

	<q-card-section>

<!--	  <q-select-->
<!--		  model-value=""-->
<!--	  />-->

	  <q-table
		  flat
		  table-header-class="bg-grey-2"
		  :columns="columns"
		  :rows="rows"
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

</style>