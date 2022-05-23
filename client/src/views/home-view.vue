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
	photo = ref<object[]>( [] ),

	// 2 step

	passportSeries = ref<null | number>( null ),
	passportNumber = ref<null | number>( null ),
	passportIssuedDate = ref<null | string>( null ),
	passportIssuedBy = ref<null | string>( null ),
	passportAddress = ref<null | string>( null ),
	passportAddressEqual = ref( false ),
	passportCode = ref<null | string>( null ),
	passportScan = ref<object[]>( [] ),

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
	certificateScan = ref<object[]>( [] ),

	// 4 step

	selectedSpecializations = ref<null | number[]>( [] ),
	socialStatus = ref<null | number[]>( [] ),
	dormitory = ref<null | boolean>( false ),

	// other

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле',
		mark : ( v : number ) => v <= 5 && v >= 1 || 'введите корректное значение'
	},

	possibleEndSchoolYears = Array( 5 ).fill( new Date().getFullYear() ).map( ( val, i ) => val - i ),

	specializations = ref<object[]>( [] ),

	socialStatuses = ref( [
		{
			statusID : -1,
			title : 'Нет'
		}
	] )


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

	try {

		const
			{ data : { socialStatuses : statuses } } = await api.get( 'social-statuses' )

		socialStatuses.value.push( ...statuses )
		loading.socialStatuses = false

	} catch ( e ) {

		console.error( e )
		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список соц. статусов',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

} )()

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

				@added=" ( files ) => photo.push( files ) "
				@removed=" ( files ) => photo.splice( photo.findIndex( p => p === files[0] ), 1 ) "
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

				@added=" ( files ) => passportScan.push( ...files ) "
				@removed=" ( files ) => passportScan.splice( passportScan.findIndex( p => p === files[0] ), 1 ) "
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

				@added=" ( files ) => certificateScan.push( files ) "
				@removed=" ( files ) => certificateScan.splice( certificateScan.findIndex( p => p === files[0] ), 1 ) "
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

			<q-toggle
				class="col-auto"
				v-model="dormitory"
				label="Мне нужно общежитие"
				checked-icon="check"
				color="green"
				unchecked-icon="clear"
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

<style lang="scss" scoped>

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