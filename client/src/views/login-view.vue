<script setup lang="ts">
import { ref, watch } from 'vue'

const
	login = ref<string | null>( localStorage.login || null ),
	password = ref<string | null>( null )

watch( login, ( value ) => !!value ? localStorage.login = value : delete localStorage.login )

</script>

<template>
  <q-card square class="login-form q-pa-md">

	<div class="text-overline">
	  Авторизация
	</div>

	<div class="text-caption text-grey">
	  Вход в панель управления для администрации колледжа
	</div>

	<q-card-section>

	  <div class="row q-gutter-md">

		<q-input
			class="col"
			v-model="login"
			label="Логин / e-mail"
			clearable
			clear-icon="clear"
		/>

		<q-input
			class="col"
			v-model="password"
			label="Пароль"
			clearable
			clear-icon="clear"
			type="password"
		/>

	  </div>

	</q-card-section>
	<q-card-actions>

	  <q-btn
		  class="full-width"
		  color="indigo-4"
		  outline
		  :disable="!login || !password"
	  >
		Авторизоваться
	  </q-btn>

	</q-card-actions>

  </q-card>
</template>

<style lang="scss" scoped>

.login-form {

  width: 30%;

  @media screen and (max-width: $breakpoint-md-max) {
    width: 70%;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 100%;
  }

}

</style>