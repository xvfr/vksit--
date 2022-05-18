<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/api'

const
	$q = useQuasar(),
	currentStep = ref( localStorage.currentStep || 'aboutMe' ),
	loading = reactive( {
		page : false,
		specializations : true,
		socialStatuses : true
	} ),

	// 1 step

	firstName = ref<null | string>( null ),
	lastName = ref<null | string>( null ),
	middleName = ref<null | string>( null ),
	birthDate = ref<null | string>( null ),
	address = ref<null | string>( null ),
	phoneNumber = ref<null | string>( null ),
	email = ref<null | string>( null ),
	photo = ref<null | string>( null ),

	// 2 step

	passportSeries = ref<null | number>( null ),
	passportNumber = ref<null | number>( null ),
	passportIssuedDate = ref<null | string>( null ),
	passportIssuedBy = ref<null | string>( null ),
	passportAddress = ref<null | string>( null ),
	passportAddressEqual = ref( false ),
	passportCode = ref<null | string>( null ),
	passportScan = ref<null | string>( null ),

	// 3 step

	certificateNumber = ref<null | number>( null ),
	schoolName = ref<null | string>( null ),
	endSchoolYear = ref<null | number>( null ),
	marks = reactive( {
		math : null,
		physics : null,
		informatics : null,
		foreign : null,
		russian : null
	} ),
	certificateScan = ref<null | number>( null ),

	// 4 step

	selectedSpecializations = ref<null | number[]>( [] ),
	socialStatus = ref<null | number[]>( [] ),
	dormitory = ref<null | boolean>( false ),

	// other

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле',
		mark : ( v : number ) => v <= 5 && v >= 1 || 'введите корректное значение'
	},

	possibleEndSchoolYears = Array( 5 ).fill( new Date().getFullYear() ).map( ( e, i ) => e -= i ),

	specializations = ref<object[]>( [] ),

	socialStatuses = ref( [
		{
			statusID : -1,
			title : 'Нет'
		}
	] )

;( async () => {

	try {

		const { data } = await api.get( 'userss' )
		console.log( data )

	} catch ( e ) {

		console.log( e )

		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список специальностей',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom'
		} )

	}

} )()

setTimeout( () => {

	specializations.value.push(
		{
			id : 1,
			name : 'Сетевое и системное администрирование',
			shortName : 'СисАдм'
		},
		{
			id : 2,
			name : 'Информационные системы и программирование/Администратор баз данных',
			shortName : 'ИСП/АдмБД'
		},
		{
			id : 9,
			name : 'Техническое обслуживание и ремонт радиоэлектронной техники',
			shortName : 'ТО'
		},
		{
			id : 3,
			name : 'Информационные системы и программирование/Программист',
			shortName : 'ИСП/Программист'
		},
		{
			id : 4,
			name : 'Информационные системы и программирование/Разработчик веб и мультимедийных приложений',
			shortName : 'ИСП/ВЕБ'
		},
		{
			id : 5,
			name : 'Обеспечение информационной безопасности телекоммуникационных систем',
			shortName : 'ОИБ'
		},
		{
			id : 11,
			name : 'Техническое обслуживание и ремонт радиоэлектронной техники/Платная',
			shortName : 'ТО/Платная'
		},
		{
			id : 6,
			name : 'Электромонтер охранно-пожарной сигнализации',
			shortName : 'ОПС'
		},
		{
			id : 7,
			name : 'Документационное обеспечение управления и архивоведение',
			shortName : 'ДО'
		}
	)

	loading.specializations = false

}, 3000 )

setTimeout( () => {

	socialStatuses.value.push( {
		statusID : 1,
		title : 'Сироты'
	} )

	loading.socialStatuses = false

}, 1700 )

watch( currentStep, ( step ) => localStorage.currentStep = step )

// pre-valid mask

watch( lastName, ( value ) =>
	nextTick( () => {
		value && ( lastName.value = value
			.replace( /[^А-ЯЁёа-я]*/g, '' )
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( firstName, ( value ) => {
	nextTick( () => {
		value && ( firstName.value = value
			.replace( /[^А-ЯЁёа-я]*/g, '' )
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
} )

watch( middleName, ( value ) => {
	nextTick( () => {
		value && ( middleName.value = value
			.replace( /[^А-ЯЁёа-я]*/g, '' )
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
} )

watch( passportAddressEqual, () => passportAddress.value = address.value )

</script>

<template>
  <q-card square class="application-form">
	<q-card-section>
	  <div class="text-overline">Подача заявления</div>

	  <!--	  <div class="text-h5 q-mt-sm q-mb-xs">Title</div>-->
	  <!--	  <div class="text-caption text-grey">-->
	  <!--		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore-->
	  <!--		magna aliqua.-->
	  <!--	  </div>-->

	  <q-stepper
		  keep-alive
		  v-model="currentStep"
		  flat
		  header-nav
		  animated
		  active-color="indigo-4"
		  active-icon="none"
		  done-color="green"
		  :vertical="$q.screen.lt.md"
	  >

		<q-step
			title="О себе"
			name="aboutMe"
			icon="info"
		>
		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model="lastName"
				label="Фамилия"
				maxlength="30"
				counter
				clearable
				clear-icon="clear"
				autogrow
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col"
				v-model="firstName"
				label="Имя"
				maxlength="30"
				counter
				clearable
				clear-icon="clear"
				autogrow
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col"
				v-model="middleName"
				label="Отчество"
				maxlength="30"
				counter
				clearable
				clear-icon="clear"
				hide-hint
				hint="* при наличии"
				autogrow
				no-error-icon
			/>
		  </div>

		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model="birthDate"
				type="date"
				stack-label
				label="Дата рождения"
				clearable
				clear-icon="clear"
				min="2000-01-01"
				:max="new Date( new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate() ).toLocaleDateString('en-ca')"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col-8"
				v-model="address"
				label="Адрес проживания"
				maxlength="120"
				counter
				clearable
				autogrow
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
		  </div>

		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model="phoneNumber"
				label="Номер телефона"
				clearable
				clear-icon="clear"
				mask="phone"
				fill-mask="_"
				prefix="+7"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col-7"
				v-model="email"
				label="E-mail"
				clearable
				maxlength="80"
				counter
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required, 'email' ]"
			/>
		  </div>

		  <div class="q-mt-md row">
			<q-uploader
				class="col q-mt-none"
				label="Фото"
				hide-upload-btn
				square
				flat
				color="indigo-4"
				accept="image/*"
			/>
		  </div>
		  <div class="text-grey text-caption">* прикрепление фото необязательно</div>

		  <q-stepper-navigation :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"
				@click="currentStep = 'passport'"
			>
			  К следующему шагу
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

		<q-step
			title="Паспортные данные"
			name="passport"
			icon="perm_identity"
		>
		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model="passportSeries"
				label="Серия"
				mask="## ##"
				unmasked-value
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col"
				v-model="passportNumber"
				label="Номер"
				mask="### ###"
				unmasked-value
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col"
				v-model="passportIssuedDate"
				type="date"
				stack-label
				label="Дата выдачи"
				clearable
				clear-icon="clear"
				min="2000-01-01"
				:max="new Date().toLocaleDateString('en-ca')"
				no-error-icon
				:rules="[ rules.required ]"
			/>
		  </div>

		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model="passportIssuedBy"
				label="Выдан"
				maxlength="120"
				counter
				clearable
				autogrow
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col-2"
				v-model="passportCode"
				label="Номер"
				mask="###-###"
				unmasked-value
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
		  </div>

		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model="passportAddress"
				label="Адрес регистрации"
				maxlength="120"
				counter
				clearable
				autogrow
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			>
			  <template v-slot>
				<q-checkbox
					class="gt-xs col-auto non-selectable text-indigo-4"
					v-model="passportAddressEqual"
					dense
					label="Совпадает с адресом проживания"
				/>
			  </template>
			</q-input>
			<q-checkbox
				class="lt-sm col-auto non-selectable text-indigo-4"
				v-model="passportAddressEqual"
				dense
				label="Совпадает с адресом проживания"
			/>
		  </div>

		  <div class="q-mt-md row">
			<q-uploader
				class="col q-mt-none"
				label="Скан"
				hide-upload-btn
				multiple
				max-files="4"
				square
				flat
				color="indigo-4"
				accept="image/*"
			/>
		  </div>
		  <div class="text-grey text-caption">* необходимо прикрепить фотографию/скан паспорта на которых видны 2,3,4,5
			страницы
		  </div>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="red-4"
				@click="currentStep = 'aboutMe'"
			>
			  К предыдущему шагу
			</q-btn>
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"
				@click="currentStep = 'certificate'"
			>
			  К следующему шагу
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

		<q-step
			title="Аттестат"
			name="certificate"
			icon="school"
		>
		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col-3"
				v-model="certificateNumber"
				label="Номер"
				mask="##############"
				unmasked-value
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-input
				class="col"
				v-model="schoolName"
				label="Название школы"
				counter
				maxlength="75"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
			<q-select
				class="col-2"
				v-model="endSchoolYear"
				label="Год окончания"
				:options="possibleEndSchoolYears"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
			/>
		  </div>

		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-input
				class="col"
				v-model.number="marks.math"
				label="Оценка по математике"
				mask="#"
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required, rules.mark ]"
			/>
			<q-input
				class="col"
				v-model.number="marks.physics"
				label="Оценка по физике"
				mask="#"
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required, rules.mark ]"
			/>
			<q-input
				class="col"
				v-model.number="marks.informatics"
				label="Оценка по информатике"
				mask="#"
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required, rules.mark ]"
			/>
			<q-input
				class="col"
				v-model.number="marks.foreign"
				label="Оценка по иностранному языку"
				mask="#"
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required, rules.mark ]"
			/>
			<q-input
				class="col"
				v-model.number="marks.russian"
				label="Оценка по русскому языку"
				mask="#"
				fill-mask="_"
				clearable
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required, rules.mark ]"
			/>
		  </div>

		  <div class="q-mt-md row">
			<q-uploader
				class="col q-mt-none"
				label="Скан"
				hide-upload-btn
				multiple
				max-files="3"
				square
				flat
				color="indigo-4"
				accept="image/*"
			/>
		  </div>
		  <div class="text-grey text-caption">* необходимо прикрепить фотографию/скан аттестата на которых видны:
			главная страница документа и приложения к аттестату с оценками (обе стороны)
		  </div>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="red-4"
				@click="currentStep = 'passport'"
			>
			  К предыдущему шагу
			</q-btn>
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"
				@click="currentStep = 'finish'"
			>
			  К следующему шагу
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

		<q-step
			title="Выбор специальности"
			name="finish"
			icon="checklist"
		>

		  <div :class="$q.screen.lt.sm || 'row q-gutter-lg'">

			<q-select
				class="col"
				label="Специальность"
				no-error-icon
				:rules="[ v => !!v.length || '* обязательное поле' ]"
				v-model="selectedSpecializations"

				:options="specializations"
				option-label="name"
				option-value="shortName"
				emit-value

				clearable
				clear-icon="clear"
				counter
				multiple
				use-chips
				use-input

				:disable="loading.specializations"
				:loading="loading.specializations"
			/>

			<q-select
				class="col"
				label="Социальный статус"
				v-model="socialStatus"

				:options="socialStatuses"
				option-value="statusID"
				option-label="title"

				clearable
				clear-icon="clear"
				counter
				multiple
				use-chips
				use-input

				:disable="loading.socialStatuses"
				:loading="loading.socialStatuses"
			/>

			<q-checkbox
				class="col-auto"
				v-model="dormitory"
				label="Мне нужно общежитие"
			/>
		  </div>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="red-4"
				@click="currentStep = 'certificate'"
			>
			  К предыдущему шагу
			</q-btn>
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="green"
			>
			  Отправить
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

	  </q-stepper>

	</q-card-section>
  </q-card>
</template>

<style lang="scss">

.application-form {
  width: 50%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 70%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>