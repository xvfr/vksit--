<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useGroups } from '@/stores/groups'
import { useSocialStatuses } from '@/stores/social-statuses'

const
	$route = useRoute(),
	$router = useRouter(),

	groupsStore = useGroups(),
	socialStatusesStore = useSocialStatuses(),

	abiturientID = $route.params.id,
	abiturientDialog = ref( true ),

	currentStep = ref( $route.query.step || 'aboutMe' ),

	firstName = ref<null | string>( null ),
	lastName = ref<null | string>( null ),
	middleName = ref<null | string>( null ),
	birthDate = ref<null | string>( null ),
	address = ref<null | string>( null ),
	phoneNumber = ref<null | string>( null ),
	email = ref<null | string>( null ),
	photo = reactive<object[]>( [] ),
	photoRef = ref(),

	passportSeries = ref<null | number>( null ),
	passportNumber = ref<null | number>( null ),
	passportIssuedDate = ref<null | string>( null ),
	passportIssuedBy = ref<null | string>( null ),
	passportAddress = ref<null | string>( null ),
	passportAddressEqual = ref( false ),
	passportCode = ref<null | string>( null ),
	passportScan = reactive<object[]>( [] ),
	passportScanRef = ref(),

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
	certificateScan = reactive<object[]>( [] ),
	certificateScanRef = ref(),

	selectedSpecializations = ref<null | object[]>( [] ),
	selectedSocialStatuses = ref<null | object[]>( [] ),
	dormitory = ref<null | boolean>( false ),
	extraFiles = reactive<object[]>( [] ),
	extraFilesRef = ref(),

	documentsTab = ref( 'photo' ),

	// TODO :: change any type
	marksList = ref<any[]>( [] ),
	statements = ref<any[]>( [] ),
	originalCertificateStatement = ref( null ),
	originalCertificateExists = ref( false ),

	// TODO :: change any type
	status = ref<any | null>( null ),

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле',
		mark : ( v : number ) => v <= 5 && v >= 1 || 'введите корректное значение'
	},

	errors = reactive( {
		exists : false // is abit exists
	} ),

	possibleEndSchoolYears = Array( 15 ).fill( new Date().getFullYear() ).map( ( val, i ) => val - i )

socialStatusesStore.get()

watch( passportAddressEqual, ( value ) => value && ( passportAddress.value = address.value ) )
watch( currentStep, step => $router.push( { query : { step } } ) )

const
	saveAbiturient = () => {
		$router.replace( { name : 'abiturients' } )
	}

// load abiturient

;( async () => {

	try {

		const { data : { items : [ response ] } } = await api( 'abiturients/' + abiturientID )

		firstName.value = response.abiturient.first_name
		lastName.value = response.abiturient.last_name
		middleName.value = response.abiturient.middle_name
		birthDate.value = new Date( response.abiturient.birth_date ).toLocaleDateString( 'en-ca' )
		address.value = response.abiturient.address
		phoneNumber.value = response.abiturient.phone
		email.value = response.abiturient.email

		passportSeries.value = response.passport.series
		passportNumber.value = response.passport.number
		passportIssuedDate.value = new Date( response.passport.issued_date ).toLocaleDateString( 'en-ca' )
		passportIssuedBy.value = response.passport.issued_by
		passportCode.value = response.passport.code
		passportAddress.value = response.passport.registration_address

		certificateNumber.value = response.certificate.number
		schoolName.value = response.certificate.school_name
		endSchoolYear.value = response.certificate.end_school_year

		statements.value = response.statements
		selectedSpecializations.value = response.statements.map( ( e : any ) => groupsStore.groups.find( g => g.groupID === e.group_id )?.shortName )

		selectedSocialStatuses.value = response.social_statuses.map( ( s : any ) => socialStatusesStore.socialStatuses.find( sc => sc.statusID === s ) )

		originalCertificateStatement.value = statements.value?.find( s => s.original_certificate )?.statement_id
		if ( originalCertificateStatement.value )
			originalCertificateExists.value = true

		status.value = response.abiturient.status

		// TODO :: add response to cache for use latter (check changed field)

	} catch {
		errors.exists = true
	}

} )()

;( async () => {

	// const
	// 	{ data } = await api.get( 'abiturients/1/photos/1', { responseType : 'blob' } ),
	// 	file = new File( [ data ], '1-1', { type : data.type } )
	//
	// photoRef.value.addFiles( [ file ] )

} )()

</script>

<template>

  <q-dialog
	  square
	  full-width
	  no-route-dismiss
	  v-model="abiturientDialog"
	  @hide=" $router.push( { name : 'abiturients' } ) "
  >

	<q-banner inline-actions class="text-white bg-red-4" v-if="errors.exists" style="width: auto !important;">
	  <b class="text-overline">Ошибка!</b> <span class="text-caption">Не удалось найти выбранного абитуриента, попробуйте вернуться и обновить страницу</span>
	</q-banner>

	<q-card class="edit-abiturient" v-else>

	  <q-card-section class="flex">
		<div class="text-overline">Редактирование абитуриента</div>
		<q-space />
		<q-badge v-if="status" outline align="middle" :color="status.color">
		  {{ status.title }}

		  <q-btn-group flat class="q-ml-xs">
			<q-btn icon="more_vert" flat round size="xs" />

			<q-menu cover transition-show="scale" transition-hide="scale" square max-width="15rem">
			  <q-btn flat color="positive" class="full-width text-caption" size="sm">Одобрено</q-btn>
			  <q-btn flat color="warning" class="full-width text-caption" size="sm">На рассмотрении</q-btn>
			  <q-btn flat color="primary" class="full-width text-caption" size="sm" disable>Необходимо редактирование
			  </q-btn>
			  <q-btn flat color="negative" class="full-width text-caption" size="sm">Отклонено</q-btn>
			</q-menu>
		  </q-btn-group>
		</q-badge>
	  </q-card-section>

	  <q-card-section class="q-pt-none">

		<q-stepper
			keep-alive
			v-model="currentStep"
			flat
			header-nav
			animated
			active-color="indigo-4"
			active-icon="none"
			vertical
		>

		  <!--			About			-->

		  <q-step title="Основная информация"
				  name="aboutMe"
				  icon="info">

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
				  :max="new Date( new Date().getFullYear() - 10, new Date().getMonth(), new Date().getDate() ).toLocaleDateString('en-ca')"
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
				  square
				  flat
				  color="indigo-4"
				  accept="image/*"

				  ref="photoRef"

				  @added=" ( files ) => photo.push( files ) "
				  @removed=" ( files ) => photo.splice( photo.findIndex( p => p === files[0] ), 1 ) "
			  />

			  <!--		TODO :: add handling upload btn on quploader	  -->

			</div>

			<q-btn outline dense class="full-width q-mt-sm" color="green-4">Сохранить</q-btn>

		  </q-step>

		  <!--			Passport			-->

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
				  label="Сканы паспорта"
				  hide-upload-btn
				  multiple
				  max-files="4"
				  square
				  flat
				  color="indigo-4"
				  accept="image/*"

				  ref="passportScanRef"

				  @added=" ( files ) => passportScan.push( ...files ) "
				  @removed=" ( files ) => passportScan.splice( passportScan.findIndex( p => p === files[0] ), 1 ) "
			  />
			</div>

			<q-btn outline dense class="full-width q-mt-sm" color="green-4">Сохранить</q-btn>

		  </q-step>

		  <!--			Certificate			-->

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

			<div :class="$q.screen.lt.sm || 'row q-gutter-lg'" v-if="marksList.length">

			  <q-input
				  v-for="mark in marksList"
				  class="col"
				  v-model.number="marks[mark.discipline_id]"
				  :label="mark.title"
				  mask="#"
				  fill-mask="_"
				  clearable
				  clear-icon="clear"
				  no-error-icon
				  :rules="[ rules.required, rules.mark ]"
				  hint="Оценка по предмету"
			  />

			</div>

			<div class="q-mt-md row">
			  <q-uploader
				  class="col q-mt-none"
				  label="Сканы аттестата"
				  hide-upload-btn
				  multiple
				  max-files="3"
				  square
				  flat
				  color="indigo-4"
				  accept="image/*"

				  ref="certificateScanRef"

				  @added=" ( files ) => certificateScan.push( files ) "
				  @removed=" ( files ) => certificateScan.splice( certificateScan.findIndex( p => p === files[0] ), 1 ) "
			  />
			</div>

			<q-btn outline dense class="full-width q-mt-sm" color="green-4">Сохранить</q-btn>

		  </q-step>

		  <!--			Specializations			-->

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
				  :rules="[ v => v && !!v.length || '* обязательное поле' ]"
				  v-model="selectedSpecializations"

				  :options="groupsStore.groups"
				  option-label="name"
				  option-value="shortName"
				  emit-value

				  behavior="dialog"

				  clearable
				  clear-icon="clear"
				  counter
				  multiple
				  use-chips
			  />

			  <q-select
				  class="col"
				  label="Социальный статус"
				  v-model="selectedSocialStatuses"

				  :options="socialStatusesStore.socialStatuses"
				  option-value="statusID"
				  option-label="title"

				  behavior="dialog"

				  counter
				  multiple
				  use-chips
			  />

			  <!--		TODO :: сделать выбор статуса как в основной форме	  -->

			  <q-toggle
				  class="col-auto"
				  v-model="dormitory"
				  label="Необходимо общежитие"
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

				  @added=" ( files ) => extraFiles.push( files ) "
				  @removed=" ( files ) => extraFiles.splice( extraFiles.findIndex( p => p === files[0] ), 1 ) "
			  />
			</div>

			<q-btn outline dense class="full-width q-mt-sm" color="green-4">Сохранить</q-btn>

		  </q-step>

		  <!--			Statements			-->

		  <q-step
			  title="Заявления"
			  name="statements"
			  icon="assignment"
		  >

			<q-toggle
				v-model="originalCertificateExists"
				checked-icon="check"
				color="primary"
				unchecked-icon="clear"
			>
			  Есть оригинал аттестата
			</q-toggle>

			<q-list bordered>

			  <!--		TODO :: add mobile friendly	  -->

			  <q-item v-for="statement of statements">

				<q-item-section side>
				  <q-item-label overline><b>#{{ statement.statement_id }}</b></q-item-label>
				  <q-item-label caption>{{ statement.created_at }}</q-item-label>
				</q-item-section>

				<q-item-section class="text-caption">
				  {{ groupsStore.groups.find( ( e : any ) => e.groupID === statement.group_id )?.name }}
				</q-item-section>

				<q-item-section side>
				  <div class="text-grey-8 q-gutter-xs">
					<q-btn-group flat>
					  <q-btn size="sm" flat dense round icon="print" />
					  <q-btn size="sm" flat dense round icon="delete" />
					</q-btn-group>

					<q-radio
						size="xs"
						label="Оригинал"
						checked-icon="task_alt"
						:val="statement.statement_id"
						v-model="originalCertificateStatement"
						:disable="!originalCertificateExists"
					/>
				  </div>
				</q-item-section>

				<q-badge floating>{{ statement.average_score }}</q-badge>

			  </q-item>

			</q-list>

			<br />

			<q-list bordered>

			  <q-item dense>
				<q-item-section>
				  <q-item-label overline>Согласие на обработку персональных данных</q-item-label>
				</q-item-section>
				<q-item-section side>
				  <div class="text-grey-8 q-gutter-xs">
					<q-btn-group flat>
					  <q-btn size="sm" flat dense round icon="print" />
					</q-btn-group>
				  </div>
				</q-item-section>
			  </q-item>

			  <q-item dense>
				<q-item-section>
				  <q-item-label overline>Заявление на общежитие</q-item-label>
				</q-item-section>
				<q-item-section side>
				  <div class="text-grey-8 q-gutter-xs">
					<q-btn-group flat>
					  <q-btn size="sm" flat dense round icon="print" />
					</q-btn-group>
				  </div>
				</q-item-section>
			  </q-item>

			</q-list>

		  </q-step>

		  <!--			Documents			-->

		  <q-step
			  title="Документы"
			  name="documents"
			  icon="cloud_upload"
		  >

			<q-card flat>
			  <q-tabs
				  v-model="documentsTab"
				  dense
				  class="text-grey"
				  active-color="indigo"
				  indicator-color="indigo"
				  align="justify"
				  narrow-indicator
			  >
				<q-tab name="photo" label="Фото" />
				<q-tab name="passport" label="Паспорт" />
				<q-tab name="certificate" label="Аттестат" />
				<q-tab name="extra" label="Дополнительные" />
			  </q-tabs>

			  <q-separator />

			  <q-tab-panels v-model="documentsTab" animated>

				<q-tab-panel name="photo">

				  <div class="q-gutter-md" :class="$q.screen.lt.sm || 'flex'">
					<q-card>
					  <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-top text-overline text-center">
						  Фото
						</div>
					  </q-img>
					  <q-card-actions>
						<q-btn-group flat class="full-width" spread>
						  <q-btn size="xs" flat dense round icon="download">скачать</q-btn>
						  <q-btn size="xs" flat dense round icon="open_in_new">предпросмотр</q-btn>
						  <q-btn size="xs" flat dense round icon="delete">удалить</q-btn>
						</q-btn-group>
					  </q-card-actions>
					</q-card>
				  </div>

				</q-tab-panel>

				<q-tab-panel name="passport">

				  <div class="q-gutter-md" :class="$q.screen.lt.sm || 'flex'">
					<q-card v-for="i in 4">
					  <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-top text-overline text-center">
						  Паспорт ({{ i }})
						</div>
					  </q-img>
					  <q-card-actions>
						<q-btn-group flat class="full-width" spread>
						  <q-btn size="xs" flat dense round icon="download">скачать</q-btn>
						  <q-btn size="xs" flat dense round icon="open_in_new">предпросмотр</q-btn>
						  <q-btn size="xs" flat dense round icon="delete">удалить</q-btn>
						</q-btn-group>
					  </q-card-actions>
					</q-card>
				  </div>

				</q-tab-panel>

				<q-tab-panel name="certificate">

				  <div class="q-gutter-md" :class="$q.screen.lt.sm || 'flex'">
					<q-card v-for="i in 3">
					  <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-top text-overline text-center">
						  Аттестат ({{ i }})
						</div>
					  </q-img>
					  <q-card-actions>
						<q-btn-group flat class="full-width" spread>
						  <q-btn size="xs" flat dense round icon="download">скачать</q-btn>
						  <q-btn size="xs" flat dense round icon="open_in_new">предпросмотр</q-btn>
						  <q-btn size="xs" flat dense round icon="delete">удалить</q-btn>
						</q-btn-group>
					  </q-card-actions>
					</q-card>
				  </div>

				</q-tab-panel>

				<q-tab-panel name="extra">
				  <q-banner dense>Нет доступных файлов</q-banner>
				</q-tab-panel>

			  </q-tab-panels>
			</q-card>

			<!--			<div class="flex q-gutter-md justify-center">-->

			<!--			  <q-card class="file-card">-->
			<!--				<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">-->
			<!--				  <div class="absolute-top text-overline text-center">-->
			<!--					Фото-->
			<!--				  </div>-->
			<!--				</q-img>-->
			<!--				<q-card-actions>-->
			<!--				  <q-btn-group flat class="full-width" spread>-->
			<!--					<q-btn size="xs" flat dense round icon="download">скачать</q-btn>-->
			<!--					<q-btn size="xs" flat dense round icon="open_in_new">предпросмотр</q-btn>-->
			<!--					<q-btn size="xs" flat dense round icon="delete">удалить</q-btn>-->
			<!--				  </q-btn-group>-->
			<!--				</q-card-actions>-->
			<!--			  </q-card>-->

			<!--			  <q-card class="file-card" v-for="i in 4">-->
			<!--				<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">-->
			<!--				  <div class="absolute-top text-overline text-center">-->
			<!--					Паспорт ({{ i }})-->
			<!--				  </div>-->
			<!--				</q-img>-->
			<!--				<q-card-actions>-->
			<!--				  <q-btn-group flat class="full-width" spread>-->
			<!--					<q-btn size="xs" flat dense round icon="download">скачать</q-btn>-->
			<!--					<q-btn size="xs" flat dense round icon="open_in_new">предпросмотр</q-btn>-->
			<!--					<q-btn size="xs" flat dense round icon="delete">удалить</q-btn>-->
			<!--				  </q-btn-group>-->
			<!--				</q-card-actions>-->
			<!--			  </q-card>-->

			<!--			  <q-card class="file-card" v-for="i in 3">-->
			<!--				<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">-->
			<!--				  <div class="absolute-top text-overline text-center">-->
			<!--					Аттестат ({{ i }})-->
			<!--				  </div>-->
			<!--				</q-img>-->
			<!--				<q-card-actions>-->
			<!--				  <q-btn-group flat class="full-width" spread>-->
			<!--					<q-btn size="xs" flat dense round icon="download">скачать</q-btn>-->
			<!--					<q-btn size="xs" flat dense round icon="open_in_new">предпросмотр</q-btn>-->
			<!--					<q-btn size="xs" flat dense round icon="delete">удалить</q-btn>-->
			<!--				  </q-btn-group>-->
			<!--				</q-card-actions>-->
			<!--			  </q-card>-->

			<!--			</div>-->

		  </q-step>

		</q-stepper>

	  </q-card-section>

	  <q-card-actions :class="$q.screen.lt.sm || 'row q-gutter-lg'">
		<q-btn class="col" dense outline color="primary">Скачать все файлы</q-btn>
	  </q-card-actions>

	</q-card>

  </q-dialog>

</template>

<style lang="scss" scoped>

.edit-abiturient {

  width: 50% !important;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 70% !important;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100% !important;;
  }

}

.file-card {

  width: 31.2%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 47%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>