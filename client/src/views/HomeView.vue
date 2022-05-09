<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'

const
	currentStep = ref( localStorage.currentStep || 'aboutMe' ),

	firstName = ref<null | string>( null ),
	lastName = ref<null | string>( null ),
	middleName = ref<null | string>( null ),
	birthDate = ref<null | string>( null ),
	address = ref<null | string>( null ),
	phoneNumber = ref<null | string>( null ),
	email = ref<null | string>( null ),
	photo = ref<null | string>( null ),

	passportSeries = ref<null | string>( null ),
	passportNumber = ref<null | string>( null ),
	passportIssuedDate = ref<null | string>( null ),
	passportIssuedBy = ref<null | string>( null ),
	passportAddress = ref<null | string>( null ),
	passportAddressEqual = ref( false ),
	passportCode = ref<null | string>( null ),
	passportScan = ref<null | string>( null ),

	rules = {
		required : ( v : string ) => !!v || '* обязательное поле'
	}

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

watch( passportAddressEqual, value => passportAddress.value = address.value )

</script>

<template>
  <q-card square>
	<q-card-section class="q-pt-xs">
	  <div class="text-overline q-mb-sm">Подача заявления</div>

	  <!--	  <div class="text-h5 q-mt-sm q-mb-xs">Title</div>-->
	  <!--	  <div class="text-caption text-grey">-->
	  <!--		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore-->
	  <!--		magna aliqua.-->
	  <!--	  </div>-->

	  <q-stepper
		  v-model="currentStep"
		  flat
		  alternative-labels
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
		  <div class="q-gutter-lg" :class="$q.screen.lt.sm || 'row'">
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

		  <div class="q-gutter-lg" :class="$q.screen.lt.sm || 'row'">
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

		  <div class="q-gutter-lg" :class="$q.screen.lt.sm || 'row'">
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

		  <div class="row q-gutter-lg q-mt-md">
			<q-uploader
				class="col q-mt-none"
				label="Фото"
				hide-upload-btn
				square
				flat
				color="indigo-4"
				accept="image/*"
			>
			  <template v-slot:list="scope">
				<q-list separator>
				  <q-item v-for="file in scope.files" :key="file.__key">
					<q-item-section>
					  <q-item-label class="full-width ellipsis">
						{{ file.name }}
					  </q-item-label>
					  <q-item-label caption>
						{{ file.__sizeLabel }} / {{ file.__progressLabel }}
					  </q-item-label>
					</q-item-section>
					<q-item-section
						v-if="file.__img"
						thumbnail
						class="gt-xs"
					>
					  <img :src="file.__img.src">
					</q-item-section>
					<q-item-section top side>
					  <q-btn
						  size="12px"
						  flat
						  dense
						  round
						  icon="delete"
						  @click="scope.removeFile(file)"
					  />
					</q-item-section>
				  </q-item>
				</q-list>
			  </template>
			</q-uploader>
		  </div>
		  <div class="text-grey text-caption">* прикрепление фото необязательно</div>
		</q-step>

		<q-step
			title="Паспортные данные"
			name="passport"
			icon="perm_identity"
		>
		  <div class="row q-gutter-lg">
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

		  <div class="row q-gutter-lg">
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
		  <div class="row q-gutter-lg">
			<q-input
				class="col-9"
				v-model="passportAddress"
				label="Адрес регистрации"
				maxlength="120"
				counter
				clearable
				autogrow
				clear-icon="clear"
				no-error-icon
				:rules="[ rules.required ]"
				:disable="passportAddressEqual"
			/>
			<q-checkbox
				class="col"
				v-model="passportAddressEqual"
				dense
				label="Совпадает с адресом проживания"
			/>
		  </div>
		  <div class="row q-gutter-lg q-mt-md">
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
			>
			  <template v-slot:list="scope">
				<q-list separator>
				  <q-item v-for="file in scope.files" :key="file.__key">
					<q-item-section>
					  <q-item-label class="full-width ellipsis">
						{{ file.name }}
					  </q-item-label>
					  <q-item-label caption>
						{{ file.__sizeLabel }} / {{ file.__progressLabel }}
					  </q-item-label>
					</q-item-section>
					<q-item-section
						v-if="file.__img"
						thumbnail
						class="gt-xs"
					>
					  <img :src="file.__img.src">
					</q-item-section>
					<q-item-section top side>
					  <q-btn
						  size="12px"
						  flat
						  dense
						  round
						  icon="delete"
						  @click="scope.removeFile(file)"
					  />
					</q-item-section>
				  </q-item>
				</q-list>
			  </template>
			</q-uploader>
		  </div>
		  <div class="text-grey text-caption">* необходимо прикрепить фотографию/скан паспорта на которых видны 2,3,4,5
			страницы
		  </div>
		</q-step>

		<q-step
			title="Аттестат"
			name="attestat"
			icon="school"
		>
		  НОМЕР
		  НАЗВАНИЕ ШКОЛЫ
		  ГОД ОКОНЧАНИЯ
		  ...ОЦЕНКИ
		  СКАН
		</q-step>

		<q-step
			title="Выбор специальности"
			name="finish"
			icon="checklist"
		>
		  СПЕЦИАЛЬНОСТЬ
		  СОЦ. СТАТУС
		  ОБЩАГА
		</q-step>

	  </q-stepper>

	</q-card-section>
  </q-card>
</template>