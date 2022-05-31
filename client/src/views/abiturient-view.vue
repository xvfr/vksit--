<script setup lang="ts">
import { nextTick, reactive, ref, unref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { laGofore } from '@quasar/extras/line-awesome'

const
	$route = useRoute(),
	$router = useRouter(),

	abiturientID = $route.params.id,
	abiturientDialog = ref( true ),

	currentStep = ref( 'aboutMe' ),

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

	selectedSpecializations = ref<null | object[]>( [] ),
	selectedSocialStatuses = ref<null | object[]>( [] ),
	dormitory = ref<null | boolean>( false ),
	extraFiles = reactive<object[]>( [] ),

	specializations = ref<object[]>( [] ),
	socialStatuses = ref( [
		{
			statusID : -1,
			title : 'Нет'
		}
	] ),

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле',
		mark : ( v : number ) => v <= 5 && v >= 1 || 'введите корректное значение'
	},

	errors = reactive( {
		exists : false // is abit exists
	} ),

	possibleEndSchoolYears = Array( 15 ).fill( new Date().getFullYear() ).map( ( val, i ) => val - i )

watch( passportAddressEqual, ( value ) => value && ( passportAddress.value = address.value ) )

const
	saveAbiturient = () => {
		$router.replace( { name : 'abiturients' } )
	}

// ;( async () => {
//
// 	const
// 		data = await fetch( 'https://cdn.shopify.com/s/files/1/0234/8017/2591/products/young-man-in-bright-fashion_925x_f7029e2b-80f0-4a40-a87b-834b9a283c39.jpg?v=1572867553'),
// 		blob = await data.blob(),
// 		file = new File( [ blob ], 'adasddas.jpg', { type : blob.type } )
//
// 	console.log( blob )
// 	console.log( file )
// 	console.log( photoRef.value.addFiles( [ file ] ) )
// 	photoRef.value.upload()
//
// } )()

</script>

<template>

  <q-dialog
	  square
	  full-width
	  v-model="abiturientDialog"
	  @hide=" $router.push( { name : 'abiturients' } ) "
  >

	<q-banner inline-actions class="text-white bg-red-4" v-if="errors.exists" style="width: auto !important;">
	  Не удалось найти выбранного абитуриента
	  <template v-slot:action>
		<q-btn flat color="white" label="Попробовать еще раз" @click="$router.go" />
	  </template>
	</q-banner>

	<q-card class="edit-abiturient" v-else>

	  <q-card-section class="flex">
		<div class="text-overline">Редактирование абитуриента</div>
		<q-space />
		<q-badge outline align="middle" color="warning">
		  На рассмотрении
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
				  hide-upload-btn
				  square
				  flat
				  color="indigo-4"
				  accept="image/*"

				  @added=" ( files ) => photo.push( files ) "
				  @removed=" ( files ) => photo.splice( photo.findIndex( p => p === files[0] ), 1 ) "
			  />
			</div>

			<q-btn outline dense class="full-width" color="green-4">Сохранить</q-btn>

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
			  />

			  <q-select
				  class="col"
				  label="Социальный статус"
				  v-model="selectedSocialStatuses"

				  :options="socialStatuses"
				  option-value="statusID"
				  option-label="title"

				  counter
				  multiple
				  use-chips
			  />

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

				  @added=" ( files ) => extraFiles.push( files ) "
				  @removed=" ( files ) => extraFiles.splice( extraFiles.findIndex( p => p === files[0] ), 1 ) "
			  />
			</div>

		  </q-step>

		  <q-step
			  title="Документы"
			  name="documents"
			  icon="cloud_upload"
		  >

			<div class="text-grey text-caption">Заявление
			  <q-icon name="open_in_new" />
			</div>
			<div class="text-grey text-caption">Согласие на обработку персональных данных
			  <q-icon name="open_in_new" />
			</div>
			<div class="text-grey text-caption">Заявление на общежитие (optional)
			  <q-icon name="open_in_new" />
			</div>

		  </q-step>

		</q-stepper>

		<!--		<div :class="$q.screen.lt.sm || 'row q-gutter-lg'" class="q-mt-md">
							<q-uploader
								class="col q-mt-none"
								:class="$q.screen.gt.sm || 'full-width'"
								label="Фото"
								hide-upload-btn
								square
								flat
								color="indigo-4"
								accept="image/*"

								ref="photoRef"

								@added=" ( files ) => photo.push( files ) "
								@removed=" ( files ) => photo.splice( photo.findIndex( p => p === files[0] ), 1 ) "
							/>

							<q-uploader
								class="col q-mt-none"
								:class="$q.screen.gt.sm || 'full-width'"
								label="Сканы паспорта"
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

							<q-uploader
								class="col q-mt-none"
								:class="$q.screen.gt.sm || 'full-width'"
								label="Сканы аттестата"
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

							<q-uploader
								class="col q-mt-none"
								:class="$q.screen.gt.sm || 'full-width'"
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
						</div>-->

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

</style>