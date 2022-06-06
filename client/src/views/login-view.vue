<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useAuth } from '@/stores/auth'

const
	authStore = useAuth(),
	login = ref<string | null>( localStorage.login || null ),
	password = ref<string | null>( null ),

	loading = reactive( {
		auth : false
	} )

watch( login, ( value ) => !!value ? localStorage.login = value : delete localStorage.login )

const authorize = async ( login: string | null, password : string | null, redirect: string | undefined ) => {

	if ( !login || !password )
		return

	loading.auth = true
	await authStore.authorize( login, password, redirect )
	loading.auth = false

}

</script>

<template>
  <q-card square class="login-form q-pa-md">

	<div class="text-overline">
	  Авторизация
	</div>

	<div class="text-caption text-grey">
	  Вход в панель управления для администрации колледжа
	</div>

	<q-form @submit=" authorize( login, password, $route.query.redirect ) ">

	  <q-card-section>

		<div :class="$q.screen.lt.sm || 'row q-gutter-md'">

		  <q-input
			  class="col"
			  v-model="login"
			  label="Логин / e-mail"
			  clearable
			  clear-icon="clear"

			  :disable="loading.auth"
		  />

		  <q-input
			  class="col"
			  v-model="password"
			  label="Пароль"
			  clearable
			  clear-icon="clear"
			  type="password"

			  :disable="loading.auth"
		  />

		</div>

	  </q-card-section>
	  <q-card-actions>

		<q-btn
			class="full-width"
			color="indigo-4"
			outline
			:disable="!login || !password || loading.auth"
			type="submit"
		>
		  Авторизоваться
		</q-btn>

	  </q-card-actions>

	  <q-inner-loading :showing="loading.auth" color="primary" size="xl" />

	</q-form>

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