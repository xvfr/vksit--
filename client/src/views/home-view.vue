<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/api'

const
	$q = useQuasar(),
	currentStep = ref( localStorage.currentStep || 'aboutMe' ),
	loading = reactive( {
		specializations : true,
		socialStatuses : true
	} ),

	// 1 step

	firstName = ref<null | string>( localStorage.firstName || null ),
	lastName = ref<null | string>( localStorage.lastName || null ),
	middleName = ref<null | string>( localStorage.middleName || null ),
	birthDate = ref<null | string>( localStorage.birthDate || null ),
	address = ref<null | string>( localStorage.address || null ),
	phoneNumber = ref<null | string>( localStorage.phoneNumber || null ),
	email = ref<null | string>( localStorage.email || null ),
	photo = reactive<object[]>( [] ),

	// 2 step

	passportSeries = ref<null | number>( localStorage.passportSeries || null ),
	passportNumber = ref<null | number>( localStorage.passportNumber || null ),
	passportIssuedDate = ref<null | string>( localStorage.passportIssuedDate || null ),
	passportIssuedBy = ref<null | string>( localStorage.passportIssuedBy || null ),
	passportAddress = ref<null | string>( localStorage.passportAddress || null ),
	passportAddressEqual = ref( false ),
	passportCode = ref<null | string>( localStorage.passportCode || null ),
	passportScan = reactive<object[]>( [] ),

	// 3 step

	certificateNumber = ref<null | number>( localStorage.certificateNumber || null ),
	schoolName = ref<null | string>( localStorage.schoolName || null ),
	endSchoolYear = ref<null | number>( localStorage.endSchoolYear || null ),
	marks = reactive( localStorage.marks ? JSON.parse( localStorage.marks ) : {
		math : null,
		physics : null,
		informatics : null,
		foreign : null,
		russian : null
	} ),
	certificateScan = reactive<object[]>( [] ),

	// 4 step

	selectedSpecializations = ref<null | object[]>( localStorage.selectedSpecializations ? JSON.parse( localStorage.selectedSpecializations ) : [] ),
	selectedSocialStatuses = ref<null | object[]>( localStorage.selectedSocialStatuses ? JSON.parse( localStorage.selectedSocialStatuses ) : [ {
		statusID : -1,
		title : 'Нет'
	} ] ),
	dormitory = ref<null | boolean>( localStorage.dormitory || false ),
	extraFiles = reactive<object[]>( [] ),
	extraFilesDialog = ref( false ),

	// other

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле',
		mark : ( v : number ) => v <= 5 && v >= 1 || 'введите корректное значение'
	},

	validation = reactive( {

		aboutMe : {
			isError : false,
			isDone : false
		},

		passport : {
			isError : false,
			isDone : false
		},

		certificate : {
			isError : false,
			isDone : false
		},

		finish : {
			isError : false,
			isDone : false
		}

	} ),

	possibleEndSchoolYears = Array( 5 ).fill( new Date().getFullYear() ).map( ( val, i ) => val - i ),

	specializations = ref<object[]>( [] ),
	socialStatuses = ref( [
		{
			statusID : -1,
			title : 'Нет'
		}
	] ),

	stepper = ref()

;( async () => {

	try {

		const
			{ data : { items } } = await api.get( 'groups' ),

			// TODO :: add groups list to pinia

			groups = items.map( ( e : any ) => ( {
				groupID : e.group_id,
				name : e.name,
				shortName : e.short_name,
				isPaid : e.is_paid
			} ) )

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
			{ data : { items } } = await api.get( 'social-statuses' ),
			statuses = items.map( ( e : any ) => ( {
				statusID : e.social_status_id,
				title : e.title
			} ) )

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

// filters

const
	groupsCache = specializations.value,
	statusesCache = socialStatuses.value

const
	filterSpecializations = ( val : any, update : any, abort : any ) =>
		update( () => specializations.value = groupsCache.filter( ( v : any ) => v.name.toLowerCase().indexOf( val.toLowerCase() ) > -1 ) ),
	filterSocialStatuses = ( val : any, update : any, abort : any ) =>
		update( () => socialStatuses.value = statusesCache.filter( ( v : any ) => v.title.toLowerCase().indexOf( val.toLowerCase() ) > -1 ) )

// watchers

watch( lastName, ( value ) =>
	nextTick( () => {
		value && ( lastName.value = value
			.replace( /[^А-ЯЁёа-я]*/g, '' )
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( firstName, ( value ) =>
	nextTick( () => {
		value && ( firstName.value = value
			.replace( /[^А-ЯЁёа-я]*/g, '' )
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( middleName, ( value ) =>
	nextTick( () => {
		value && ( middleName.value = value
			.replace( /[^А-ЯЁёа-я]*/g, '' )
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( passportAddressEqual, () => passportAddress.value = address.value )

watch( selectedSocialStatuses, ( value ) => {

	if ( value?.length === 0 )
		return selectedSocialStatuses.value = [ { statusID : -1, title : 'Нет' } ]

	if ( !value || value.length <= 1 )
		return

	const
		lastValue = value[ value.length - 1 ] as any

	if ( lastValue.statusID === -1 )

		selectedSocialStatuses.value = [ { statusID : -1, title : 'Нет' } ]

	else {

		const
			negativeIndex = value.findIndex( ( f : any ) => f.statusID === -1 )

		if ( negativeIndex !== -1 )
			selectedSocialStatuses.value?.splice( negativeIndex, 1 )

	}

} )

const validateComponents = ( components : { validate () : boolean }[] ) => {

	let
		isValid = true

	for ( const component of components ) {

		if ( !component.validate() )
			isValid = false

	}

	return isValid

}

const validateForm = ( formRef : any, step : 'aboutMe' | 'passport' | 'certificate' | 'finish' ) => {

	if ( validateComponents( formRef.getValidationComponents() ) ) {

		stepper.value.next()
		validation[ step ].isDone = true

	} else {

		validation[ step ].isError = true
		$q.notify( {
			message : 'Проверьте введенные данные',
			type : 'negative'
		} )

	}

}

// save values to localstorage

const toggleLocalStorage = ( target : string, value : any ) => value ? localStorage[ target ] = String( value ) : delete localStorage[ target ]

watch( currentStep, ( step ) => localStorage.currentStep = step )

watch( lastName, ( value ) => toggleLocalStorage( 'lastName', value ) )
watch( firstName, ( value ) => toggleLocalStorage( 'firstName', value ) )
watch( middleName, ( value ) => toggleLocalStorage( 'middleName', value ) )
watch( birthDate, ( value ) => toggleLocalStorage( 'birthDate', value ) )
watch( address, ( value ) => toggleLocalStorage( 'address', value ) )
watch( phoneNumber, ( value ) => toggleLocalStorage( 'phoneNumber', value ) )
watch( email, ( value ) => toggleLocalStorage( 'email', value ) )

watch( passportSeries, ( value ) => toggleLocalStorage( 'passportSeries', value ) )
watch( passportNumber, ( value ) => toggleLocalStorage( 'passportNumber', value ) )
watch( passportIssuedDate, ( value ) => toggleLocalStorage( 'passportIssuedDate', value ) )
watch( passportIssuedBy, ( value ) => toggleLocalStorage( 'passportIssuedBy', value ) )
watch( passportAddress, ( value ) => toggleLocalStorage( 'passportAddress', value ) )
watch( passportCode, ( value ) => toggleLocalStorage( 'passportCode', value ) )

watch( certificateNumber, ( value ) => toggleLocalStorage( 'certificateNumber', value ) )
watch( schoolName, ( value ) => toggleLocalStorage( 'schoolName', value ) )
watch( endSchoolYear, ( value ) => toggleLocalStorage( 'endSchoolYear', value ) )
watch( marks, ( value ) => toggleLocalStorage( 'marks', JSON.stringify( value ) ) )

watch( selectedSpecializations, ( value ) => toggleLocalStorage( 'selectedSpecializations', JSON.stringify( value ) ) )
watch( selectedSocialStatuses, ( value ) => toggleLocalStorage( 'selectedSocialStatuses', JSON.stringify( value ) ) )
watch( dormitory, ( value ) => toggleLocalStorage( 'dormitory', value ) )

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

		  ref="stepper"
	  >

		<q-step
			title="О себе"
			name="aboutMe"
			icon="info"

			:done="validation.aboutMe.isDone"
			:error="validation.aboutMe.isError"
		>

		  <q-form ref="firstStepForm">

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

		  </q-form>

		  <q-stepper-navigation :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"

				@click=" validateForm( $refs.firstStepForm, 'aboutMe' ) "
			>
			  К следующему шагу
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

		<q-step
			title="Паспортные данные"
			name="passport"
			icon="perm_identity"

			:done="validation.passport.isDone"
			:error="validation.passport.isError"
		>

		  <q-form ref="sendStepForm">

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
				  label="Код подразделения"
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
			<div class="text-grey text-caption">* необходимо прикрепить фотографию/скан паспорта на которых видны
			  2,3,4,5
			  страницы
			</div>

		  </q-form>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="red-4"
				@click="$refs.stepper.previous()"
			>
			  К предыдущему шагу
			</q-btn>
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"

				@click=" validateForm( $refs.sendStepForm, 'passport' ) "
			>
			  К следующему шагу
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

		<q-step
			title="Аттестат"
			name="certificate"
			icon="school"

			:done="validation.certificate.isDone"
			:error="validation.certificate.isError"
		>

		  <q-form ref="thirdStepForm">

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

		  </q-form>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="red-4"
				@click="$refs.stepper.previous()"
			>
			  К предыдущему шагу
			</q-btn>
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"

				@click=" validateForm( $refs.thirdStepForm, 'certificate' ) "
			>
			  К следующему шагу
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

		<q-step
			title="Выбор специальности"
			name="finish"
			icon="checklist"

			:done="validation.finish.isDone"
			:error="validation.finish.isError"
		>

		  <q-form>

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

				  behavior="dialog"

				  @filter="filterSpecializations"

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
				  v-model="selectedSocialStatuses"

				  :options="socialStatuses"
				  option-value="statusID"
				  option-label="title"

				  behavior="dialog"

				  @filter="filterSocialStatuses"

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
				  true-value="true"
			  />

			</div>

			<div class="q-mt-md row">
			  <q-uploader
				  class="col q-mt-none"
				  label="Дополнительные файлы"
				  hide-upload-btn
				  multiple
				  max-files="7"
				  square
				  flat
				  color="indigo-4"
				  accept="image/*"

				  @added=" ( files ) => extraFiles.push( files ) "
				  @removed=" ( files ) => extraFiles.splice( extraFiles.findIndex( p => p === files[0] ), 1 ) "
			  />
			</div>
			<div class="text-blue-5 cursor-pointer text-caption" @click="extraFilesDialog = true">Какие файлы можно
			  прикрепить?
			</div>

		  </q-form>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="red-4"
				@click="$refs.stepper.previous()"
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

  <q-dialog v-model="extraFilesDialog" square>
	<q-card>
	  <q-card-section>
		<div class="text-overline">Извлечение из правил приема 2022 - 2023 уч. г.</div>
	  </q-card-section>
	  <q-card-section class="q-py-none">
		<p class="text-caption">
		  31. При приеме на обучение по образовательным программам приёмной комиссией
		  учитываются результаты индивидуальных достижений в следующем порядке:
		</p>
		<p class="text-caption">
		  - наличие статуса победителя и призера в олимпиадах и иных интеллектуальных
		  мероприятиях, направленных на развитие интереса к научной (научно-исследовательской),
		  инженерно-технической, изобретательской, а также на пропаганду научных знаний, в соответствии
		  с постановлением Правительства Российской Федерации от 17 ноября 2015 г. N 1239 "Об
		  утверждении Правил выявления детей, проявивших выдающиеся способности, сопровождения и
		  мониторинга их дальнейшего развития" (Собрание законодательства Российской Федерации, 2015,
		  N 47, ст. 6602; 2016, N 20, ст. 2837; 2017, N 28, ст. 4134; N 50, ст. 7633; 2018, N
		  46, ст. 7061);
		</p>
		<p class="text-caption">
		  - наличие у поступающего статуса победителя и призера чемпионата профессионального
		  мастерства, проводимого союзом "Агентство развития профессиональных сообществ и рабочих
		  кадров "Молодые профессионалы (Ворлдскиллс Россия)" либо международной организацией
		  "WorldSkills International";
		</p>
		<p class="text-caption">
		  - наличие статуса победителя или призера чемпионата профессионального мастерства,
		  проводимого международной организацией «Ворлдскиллс Европа» (WorldSkills Europe);
		</p>
		<p class="text-caption">
		  - наличие у поступающего статуса победителя и призера чемпионата по профессиональному
		  мастерству среди инвалидов и лиц с ограниченными возможностями здоровья "Абилимпикс";
		</p>
		<p class="text-caption">
		  - наличие статуса чемпиона или призера Олимпийских, Паралимпийских и Сурдолимпийских
		  игр, чемпиона мира или Европы. Учитывается наличие первого места на первенствах мира или
		  Европы по различным видам спорта;
		</p>
		<p class="text-caption">
		  - наличие статуса победителя и призера в олимпиадах и мероприятиях, направленных на
		  развитие творческих способностей, способностей к занятиям физической культурой и спортом,
		  творческой, физкультурно-спортивной деятельности, имеющих знак ГТО, а также на пропаганду
		  научных знаний, творческих и спортивных достижений в соответствии с постановлением
		  Правительства Российской Федерации от 17 ноября 2015 г. N 1239 "Об утверждении Правил
		  выявления детей, проявивших выдающиеся способности, сопровождения и мониторинга их
		  дальнейшего развития" (Собрание законодательства Российской Федерации, 2015, N 47, ст. 6602;
		  2016, N 20, ст. 2837; 2017, N 28, ст. 4134; N 50, ст. 7633; 2018, N 46, ст. 7061);
		</p>
		<p class="text-caption">
		  - сертификат АПОУ ВО «Вологодский колледж связи и информационных технологий» об
		  освоении обучающимися дополнительной общеобразовательной общеразвивающей программы
		  технической направленности;
		</p>
		<p class="text-caption">
		  - документ подтверждающий участие в добровольческой деятельности.
		</p>
	  </q-card-section>
	  <q-card-actions class="q-pt-none">
		<q-btn class="full-width" v-close-popup flat color="red-4">Закрыть</q-btn>
	  </q-card-actions>
	</q-card>
  </q-dialog>

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