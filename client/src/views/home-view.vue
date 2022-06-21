<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/api'
import { useGroups } from '@/stores/groups'
import { useSocialStatuses } from '@/stores/social-statuses'
import { AxiosError } from 'axios'
import { useAuth } from '@/stores/auth'

const
	$q = useQuasar(),

	authStore = useAuth(),
	groupsStore = useGroups(),
	socialStatusesStore = useSocialStatuses(),

	currentStep = ref( localStorage.currentStep || 'aboutMe' ),
	loading = reactive( {
		page : true,
		marks : true
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
	photoRef = ref(),

	// 2 step

	passportSeries = ref<null | number>( localStorage.passportSeries || null ),
	passportNumber = ref<null | number>( localStorage.passportNumber || null ),
	passportIssuedDate = ref<null | string>( localStorage.passportIssuedDate || null ),
	passportIssuedBy = ref<null | string>( localStorage.passportIssuedBy || null ),
	birthPlace = ref<null | string>( localStorage.birthPlace || null ),
	passportAddress = ref<null | string>( localStorage.passportAddress || null ),
	passportAddressEqual = ref( false ),
	passportCode = ref<null | string>( localStorage.passportCode || null ),
	passportScan = reactive<object[]>( [] ),
	passportScanRef = ref(),

	// 3 step

	certificateNumber = ref<null | number>( localStorage.certificateNumber || null ),
	schoolName = ref<null | string>( localStorage.schoolName || null ),
	endSchoolYear = ref<null | number>( localStorage.endSchoolYear || null ),
	marks = reactive<{ disciplineID : number, value : null | number }[]>( localStorage.marks ? JSON.parse( localStorage.marks ) : [] ),
	marksList = ref<{ disciplineID : number, title : string }[]>( [] ),
	certificateScan = reactive<object[]>( [] ),
	certificateScanRef = ref(),

	// 4 step

	selectedSpecializations = ref<object[] | null>( localStorage.selectedSpecializations ? JSON.parse( localStorage.selectedSpecializations ) : [] ),
	selectedSocialStatuses = ref<object[] | null>( localStorage.selectedSocialStatuses ? JSON.parse( localStorage.selectedSocialStatuses ) : [] ),
	dormitory = ref<boolean>( localStorage.dormitory || false ),
	extraFiles = reactive<object[]>( [] ),
	extraFilesRef = ref(),
	extraFilesDialog = ref( false ),

	// other

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле',
		mark : ( v : number ) => v <= 5 && v >= 1 || '* некорректное значение',
		onlyRussianLetters : ( v : string ) => !v || /^[А-ЯЁёа-я]+$/.test( v ) || '* только кириллица, без пробелов'
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

	stepper = ref(),

	aboutFormRef = ref(),
	passportFormRef = ref(),
	certificateFormRef = ref(),
	finishFormRef = ref(),

	errors = ref<{ field : string, message : string }[]>( [] )

socialStatusesStore.get()

;( async () => {

	try {

		const
			{ data : { items } } = await api.get( 'disciplines' ),

			disciplines = items.map( ( e : any ) => ( {
				disciplineID : e.discipline_id,
				title : e.name
			} ) )

		for ( const dis of disciplines ) {

			if ( !marks.find( e => e.disciplineID === dis.disciplineID ) )
				marks.push( {
					disciplineID : dis.disciplineID,
					value : null
				} )

		}

		marksList.value.push( ...disciplines )
		loading.marks = false

	} catch ( e ) {

		console.error( e )

		$q.notify( {
			progress : true,
			message : 'Не удалось загрузить список дисциплин',
			caption : 'Подробная информация в консоли',
			type : 'warning',
			position : 'bottom-left'
		} )

	}

} )()

// watchers

watch( lastName, ( value ) =>
	nextTick( () => {
		value && ( lastName.value = value
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( firstName, ( value ) =>
	nextTick( () => {
		value && ( firstName.value = value
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( middleName, ( value ) =>
	nextTick( () => {
		value && ( middleName.value = value
			.replace( /^[а-я]/, value[ 0 ].toUpperCase() ) )
	} )
)

watch( passportAddressEqual, () => passportAddress.value = address.value )

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

	let
		isValid = true,
		scanError = false

	if ( step === 'passport' && !authStore.isAuthorized ) {

		if ( !passportScan.length ) {

			scanError = true

			$q.notify( {
				type : 'warning',
				message : 'Прикрепите сканы паспорта',
				timeout : 3000,
				progress : true
			} )

		}

	}

	if ( step === 'certificate' && !authStore.isAuthorized ) {

		if ( !certificateScan.length ) {

			scanError = true

			$q.notify( {
				type : 'warning',
				message : 'Прикрепите сканы аттестата',
				timeout : 3000,
				progress : true
			} )

		}

	}

	if ( validateComponents( formRef.getValidationComponents() ) && !scanError ) {

		validation[ step ].isDone = true

	} else {

		isValid = false

		validation[ step ].isError = true
		$q.notify( {
			message : 'Проверьте введенные данные',
			caption : 'Исправьте ошибки и попробуйте снова',
			type : 'negative'
		} )

	}

	return isValid

}

// on mounted

onMounted( () =>

		loading.page = false
	// TODO :: compare local specializations with loaded

)

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
watch( birthPlace, ( value ) => toggleLocalStorage( 'birthPlace', value ) )
watch( passportAddress, ( value ) => toggleLocalStorage( 'passportAddress', value ) )
watch( passportCode, ( value ) => toggleLocalStorage( 'passportCode', value ) )

watch( certificateNumber, ( value ) => toggleLocalStorage( 'certificateNumber', value ) )
watch( schoolName, ( value ) => toggleLocalStorage( 'schoolName', value ) )
watch( endSchoolYear, ( value ) => toggleLocalStorage( 'endSchoolYear', value ) )
watch( marks, ( value ) => toggleLocalStorage( 'marks', JSON.stringify( value ) ) )

watch( selectedSpecializations, ( value ) => toggleLocalStorage( 'selectedSpecializations', JSON.stringify( value ) ) )
watch( selectedSocialStatuses, ( value ) => toggleLocalStorage( 'selectedSocialStatuses', JSON.stringify( value ) ) )
watch( dormitory, ( value ) => toggleLocalStorage( 'dormitory', value ) )

// remove files from q-uploader stash

const removeFileFromStash = ( stash : any, files : any[] ) => {
	for ( const file of files ) {
		stash.splice( stash.findIndex( ( s : any ) => s === file ), 1 )
	}
}

// send application

const sendApplication = async () => {

	loading.page = true
	errors.value = []

	let
		date = new Date(),
		errorsCount = 0

	if ( !lastName.value || !/^[А-ЯЁёа-я]+$/.test( lastName.value ) )
		errorsCount++

	if ( !firstName.value || !/^[А-ЯЁёа-я]+$/.test( firstName.value ) )
		errorsCount++

	if ( !!middleName.value && !/^[А-ЯЁёа-я]+$/.test( middleName.value ) )
		errorsCount++

	if ( !birthDate.value || new Date( birthDate.value ).getFullYear() > date.getFullYear() - 15 || date.getFullYear() - new Date( birthDate.value ).getFullYear() > 50 )
		errorsCount++

	if ( !address.value )
		errorsCount++

	if ( !phoneNumber.value || !/^\(\d{3}\)\s\d{3}\s-\s\d{4}$/.test( phoneNumber.value ) )
		errorsCount++

	// not required for admin but regexp for all
	if ( ( !authStore.isAuthorized && !email.value ) || ( email.value && !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/.test( email.value ) ) )
		errorsCount++

	if ( errorsCount ) {

		await nextTick( stepper.value.goTo( 'aboutMe' ) )
		validateForm( aboutFormRef.value, 'aboutMe' )
		return loading.page = false

	}

	if ( !passportSeries.value || String( passportSeries.value ).length !== 4 )
		errorsCount++

	if ( !passportNumber.value || String( passportNumber.value ).length !== 6 )
		errorsCount++

	if ( !passportIssuedDate.value )
		errorsCount++

	if ( !passportIssuedBy.value )
		errorsCount++

	if ( !passportCode.value || String( passportCode.value ).length !== 6 )
		errorsCount++

	if ( !passportAddress.value )
		errorsCount++

	if ( !passportScan.length && !authStore.isAuthorized )
		errorsCount++

	if ( errorsCount ) {

		await nextTick( stepper.value.goTo( 'passport' ) )
		validateForm( passportFormRef.value, 'passport' )
		return loading.page = false

	}

	if ( !certificateNumber.value || String( certificateNumber.value ).length !== 14 )
		errorsCount++

	if ( !schoolName.value )
		errorsCount++

	if ( !endSchoolYear.value )
		errorsCount++

	if ( !marksList.value.length ) {

		errorsCount++
		$q.notify( {
			type : 'warning',
			message : 'Не удалось записать оценки по предметам',
			caption : 'Попробуйте перезагрузить страницу и заполнить оценки ещё раз',
			timeout : 5000,
			progress : true
		} )

	} else if ( marksList.value.length !== marks.length ) {

		errorsCount++
		$q.notify( {
			type : 'warning',
			message : 'Заполнены не все оценки',
			caption : 'Если на странице видны не все оценки, попробуйте перезагрузить страницу',
			timeout : 5000,
			progress : true
		} )

	}

	for ( const mark of marks ) {
		if ( isNaN( Number( mark.value ) ) )
			errorsCount++
	}

	if ( !certificateScan.length && !authStore.isAuthorized )
		errorsCount++

	if ( errorsCount ) {

		await nextTick( stepper.value.goTo( 'certificate' ) )
		validateForm( certificateFormRef.value, 'certificate' )
		return loading.page = false

	}

	if ( !selectedSpecializations.value || !selectedSpecializations.value.length )
		errorsCount++

	if ( errorsCount ) {

		await nextTick( stepper.value.goTo( 'finish' ) )
		validateForm( finishFormRef.value, 'finish' )
		return loading.page = false

	}

	// all is valid

	const
		data = new FormData()

	data.append( 'firstName', firstName.value as any )
	data.append( 'lastName', lastName.value as any )
	if ( middleName.value )
		data.append( 'middleName', middleName.value as any )
	data.append( 'birthDate', birthDate.value as any )
	data.append( 'address', address.value as any )
	data.append( 'phoneNumber', phoneNumber.value as any )
	if ( email.value )
		data.append( 'email', email.value as any )
	for ( const file of photo as any )
		data.append( 'photo', file )

	data.append( 'passportSeries', passportSeries.value as any )
	data.append( 'passportNumber', passportNumber.value as any )
	data.append( 'passportIssuedDate', passportIssuedDate.value as any )
	data.append( 'passportIssuedBy', passportIssuedBy.value as any )
	data.append( 'birthPlace', birthPlace.value as any )
	data.append( 'passportAddress', passportAddress.value as any )
	data.append( 'passportCode', passportCode.value as any )
	for ( const file of passportScan as any )
		data.append( 'passportScan', file )

	data.append( 'certificateNumber', certificateNumber.value as any )
	data.append( 'schoolName', schoolName.value as any )
	data.append( 'endSchoolYear', endSchoolYear.value as any )
	data.append( 'marksRaw', JSON.stringify( marks ) )
	for ( const file of certificateScan as any )
		data.append( 'certificateScan', file )

	data.append( 'selectedSpecializationsRaw', ( selectedSpecializations.value as any )?.map( ( s : any ) => s.groupID ) )
	data.append( 'selectedSocialStatusesRaw', ( selectedSocialStatuses.value as any )?.map( ( s : any ) => s.statusID ) )
	data.append( 'dormitory', dormitory.value as any )
	for ( const file of extraFiles as any )
		data.append( 'extraFiles', file )

	try {

		await api.post( '/abiturients', data )

		// TODO :: get token for append application groups

		$q.notify( {
			message : 'Заявление успешно подано',
			caption : 'После подтверждения на указанную почту придет оповещение',
			position : 'center',
			type : 'positive',
			progress : true
		} )

	} catch ( e ) {

		console.error( e )

		if ( e instanceof AxiosError && e.response?.status === 400 ) {

			for ( const err of e.response.data.error?.fields ) {
				errors.value.push( { field : err.field, message : err.description } )
			}

		} else {

			$q.notify( {
				type : 'warning',
				message : 'Произошла непредвиденная ошибка, попробуйте повторить попытку позже',
				caption : 'Подробная информация об ошибке в консоли',
				timeout : 5000,
				position : 'center',
				progress : true
			} )

		}

	}

	loading.page = false

}

const rejectFiles = ( entities : { failedPropValidation : string, file : File }[] ) => {

	for ( const entity of entities ) {

		if ( entity.failedPropValidation === 'max-file-size' ) {

			$q.notify( {
				type : 'warning',
				message : 'Превышен максимальный размер файла',
				caption : entity.file.name + ` (${ ( entity.file.size / 1024 / 1024 ).toFixed( 2 ) }MB)`,
				timeout : 5000,
				position : 'bottom-left',
				progress : true
			} )

		} else if ( entity.failedPropValidation === 'max-files' ) {

			$q.notify( {
				type : 'warning',
				message : 'Превышено максимальное количество файлов',
				caption : entity.file.name,
				timeout : 5000,
				position : 'bottom-left',
				progress : true
			} )

		} else {

			$q.notify( {
				type : 'warning',
				message : 'Не удалось добавить файл',
				caption : entity.file.name,
				timeout : 5000,
				position : 'bottom-left',
				progress : true
			} )

		}

	}

}

const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const clearForm = () => {
	firstName.value = null
	lastName.value = null
	middleName.value = null
	birthDate.value = null
	address.value = null
	phoneNumber.value = null
	email.value = null
	photo.splice( 0, photo.length )
	if ( photoRef.value )
		photoRef.value.reset()

	passportSeries.value = null
	passportNumber.value = null
	birthPlace.value = null
	passportIssuedBy.value = null
	passportIssuedDate.value = null
	passportCode.value = null
	passportAddress.value = null
	passportScan.splice( 0, passportScan.length )
	if ( passportScanRef.value )
		passportScanRef.value.reset()

	certificateNumber.value = null
	schoolName.value = null
	endSchoolYear.value = null
	marks.forEach( s => s.value = null )
	certificateScan.splice( 0, certificateScan.length )
	if ( certificateScanRef.value )
		certificateScanRef.value.reset()

	selectedSpecializations.value = null
	selectedSocialStatuses.value = null
	dormitory.value = false
	extraFiles.splice( 0, extraFiles.length )
	if ( extraFilesRef.value )
		extraFilesRef.value.reset()
}

</script>

<template>
  <q-card square class="application-form">
	<q-card-section>

	  <div class="flex items-baseline">
		<div class="text-overline">Подача заявления</div>
		<q-space></q-space>
		<q-btn size="sm" outline color="negative" align="right" tabindex="-1" @click="clearForm">Очистить форму</q-btn>
	  </div>

	  <q-slide-transition>
		<q-banner inline-actions v-if="errors.length" class="bg-red-4 text-white">
		  <div class="text-overline">В ходе выполнения запроса произошли следующие ошибки, исправьте их и попробуйте
			снова
		  </div>

		  <div class="text-caption" v-for="error in errors">
			{{ error.field }} - {{ error.message.charAt( 0 ).toLowerCase() + error.message.slice( 1 ) }}
		  </div>

		  <template v-slot:action>
			<q-btn flat label="Закрыть" @click="errors = []" />
		  </template>
		</q-banner>
	  </q-slide-transition>

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

		  <q-form ref="aboutFormRef">

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
				  :rules="[ rules.required, rules.onlyRussianLetters ]"

				  tabindex="1"
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
				  :rules="[ rules.required, rules.onlyRussianLetters ]"

				  tabindex="2"
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
				  :rules="[ rules.onlyRussianLetters ]"

				  tabindex="3"
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
				  :max="new Date( new Date().getFullYear() - 15, new Date().getMonth(), new Date().getDate() ).toLocaleDateString('en-ca')"
				  no-error-icon
				  :rules="[
					  rules.required,
					  v => new Date(v).getFullYear() < new Date().getFullYear() - 15 || '* неверная дата рождения',
					  v => new Date().getFullYear() - new Date(v).getFullYear() < 50 || '* неверная дата рождения'
				  ]"

				  tabindex="4"
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

				  tabindex="5"
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
				  :rules="[
					  rules.required,
					  v => !!v && /^\(\d{3}\)\s\d{3}\s-\s\d{4}$/.test(v) || '* обязательное поле'
				  ]"

				  tabindex="6"
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
				  :rules="[
					  v => authStore.isAuthorized || !!v || '* обязательное поле',
					  v => !!v && emailRegexp.test(v) || !v && authStore.isAuthorized || '* некорректный e-mail'
				  ]"

				  tabindex="7"
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

				  max-file-size="3145728"
				  @rejected="rejectFiles"

				  ref="photoRef"

				  @added=" ( files ) => photo.push( ...files ) "
				  @removed=" ( files ) => removeFileFromStash( photo, files ) "
			  />

			</div>
			<div class="text-grey text-caption">* прикрепление фото необязательно | максимальный размер файла 3МБ</div>

		  </q-form>

		  <q-stepper-navigation :class="$q.screen.lt.sm || 'row q-gutter-lg'">
			<q-btn
				:class="$q.screen.lt.sm ? 'full-width' : 'col'"
				outline
				color="indigo-4"

				@click=" validateForm( $refs.aboutFormRef, 'aboutMe' ) ? $refs.stepper.next() : null "
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

		  <q-form ref="passportFormRef">

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
				  :rules="[
					  rules.required,
					  v => !!v && v.length === 4 || '* обязательное поле'
				  ]"

				  tabindex="8"
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
				  :rules="[
					  rules.required,
					  v => !!v && v.length === 6 || '* обязательное поле'
				  ]"

				  tabindex="9"
			  />

			  <q-input
				  class="col-3"
				  v-model="birthPlace"
				  label="Место рождения"
				  maxlength="50"
				  counter
				  clearable
				  autogrow
				  clear-icon="clear"
				  no-error-icon
				  :rules="[ rules.required ]"

				  tabindex="12"
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

				  tabindex="11"
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

				  tabindex="10"
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
				  :rules="[
					  rules.required,
					  v => !!v && v.length === 6 || '* обязательное поле'
				  ]"

				  tabindex="13"
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

				  tabindex="14"
			  >
				<template v-slot>
				  <q-checkbox
					  class="gt-xs col-auto non-selectable text-indigo-4"
					  v-model="passportAddressEqual"
					  dense
					  label="Совпадает с адресом проживания"

					  tabindex="15"
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

				  ref="passportScanRef"

				  max-file-size="3145728"
				  @rejected="rejectFiles"

				  @added=" ( files ) => passportScan.push( ...files ) "
				  @removed=" ( files ) => removeFileFromStash( passportScan, files ) "
			  />
			</div>
			<div class="text-grey text-caption">* необходимо прикрепить фотографию/скан паспорта на которых видны
			  2,3,4,5 страницы | максимальный размер одного файла 3МБ
			</div>

		  </q-form>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				class="gt-sm"
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

				@click=" validateForm( $refs.passportFormRef, 'passport' ) ? $refs.stepper.next() : null "
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

		  <q-form ref="certificateFormRef">

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
				  :rules="[
					  rules.required,
					  v => !!v && v.length === 14 || '* обязательное поле'
				  ]"

				  tabindex="14"
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

				  tabindex="15"
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

				  tabindex="16"
			  />

			</div>

			<div :class="$q.screen.lt.sm || 'row q-gutter-lg'">

			  <q-skeleton v-if="loading.marks" class="q-mt-xl q-mb-sm" square type="QInput" width="100%"></q-skeleton>

			  <q-input
				  v-for="(mark, index) in marksList"
				  class="col"
				  v-model.number="marks.find( e => e.disciplineID === mark.disciplineID ).value"
				  :label="mark.title"
				  unmasked-value
				  mask="#"
				  fill-mask="_"
				  clearable
				  clear-icon="clear"
				  no-error-icon
				  :rules="[ rules.mark, rules.required ]"
				  hint="Оценка по предмету"

				  :tabindex="17 + index"
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

				  ref="certificateScanRef"

				  max-file-size="3145728"
				  @rejected="rejectFiles"

				  @added=" ( files ) => certificateScan.push( ...files ) "
				  @removed=" ( files ) => removeFileFromStash( certificateScan, files ) "
			  />
			</div>
			<div class="text-grey text-caption">* необходимо прикрепить фотографию/скан аттестата на которых видны:
			  главная страница документа и приложения к аттестату с оценками (обе стороны) | максимальный размер одного
			  файла 3МБ
			</div>

		  </q-form>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				class="gt-sm"
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

				@click=" validateForm( $refs.certificateFormRef, 'certificate' ) ? $refs.stepper.next() : null "
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

		  <q-form ref="finishFormRef">

			<div :class="$q.screen.lt.sm || 'row q-gutter-lg items-baseline'">

			  <q-select
				  class="col"
				  label="Специальность"
				  no-error-icon
				  :rules="[ v => v?.length || '* необходимо выбрать хотя бы одну специальность' ]"
				  v-model="selectedSpecializations"

				  :options="groupsStore.groups"
				  option-label="name"
				  option-value="groupID"

				  :error="groupsStore.isError"
				  :error-message="groupsStore.isError ? 'Не удалось загрузить список специальностей' : undefined"

				  behavior="dialog"

				  clearable
				  clear-icon="clear"
				  :counter="!groupsStore.isLoading && !groupsStore.isError"
				  multiple
				  use-chips

				  :loading="groupsStore.isLoading"
				  :disable="groupsStore.isLoading || groupsStore.isError"
			  >
				<template v-slot:selected-item="scope">
				  <q-chip
					  removable
					  dense
					  @remove="scope.removeAtIndex(scope.index)"
				  >
					{{ scope.opt.shortName }}
				  </q-chip>
				</template>
			  </q-select>

			  <q-select
				  class="col"
				  label="Социальный статус"
				  no-error-icon
				  v-model="selectedSocialStatuses"

				  :options="socialStatusesStore.socialStatuses"
				  option-value="statusID"
				  option-label="title"

				  clearable
				  clear-icon="clear"

				  behavior="dialog"

				  :error="socialStatusesStore.isError"
				  error-message="Не удалось загрузить список социальных статусов"

				  :counter="!socialStatusesStore.isLoading && !socialStatusesStore.isError"
				  multiple
				  use-chips

				  :loading="socialStatusesStore.isLoading"
				  :disable="socialStatusesStore.isLoading || socialStatusesStore.isError"
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

				  ref="extraFilesRef"

				  max-file-size="3145728"
				  @rejected="rejectFiles"

				  @added=" ( files ) => extraFiles.push( ...files ) "
				  @removed=" ( files ) => removeFileFromStash( extraFiles, files ) "
			  />
			</div>
			<div class="text-caption text-grey">* необязательно | максимальный размер одного файла 3МБ</div>
			<div class="text-blue-5 cursor-pointer text-caption" @click="extraFilesDialog = true">Какие файлы можно
			  прикрепить?
			</div>

		  </q-form>

		  <q-stepper-navigation class="row q-gutter-md">
			<q-btn
				class="gt-sm"
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
				@click="sendApplication"
			>
			  Отправить
			</q-btn>
		  </q-stepper-navigation>

		</q-step>

	  </q-stepper>

	</q-card-section>

	<q-inner-loading :showing="loading.page" color="primary" size="xl" />

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