<script setup lang="ts">
import { ref } from 'vue'
import NavigationRoutes from '@/components/navigation-routes.vue'
import { useAuth } from '@/stores/auth'
import { useGroups } from '@/stores/groups'

const
	authStore = useAuth(),
	groupsStore = useGroups(),
	drawer = ref( false )

groupsStore.get()

</script>

<template>
  <q-layout class="shadow-2 rounded-borders">
	<q-header elevated>
	  <q-toolbar class="bg-indigo-4">
		<q-btn @click="drawer = !drawer" flat round dense icon="menu" class="q-mr-sm lt-md" />

		<q-avatar size="md" rounded class="cursor-pointer" @click="$router.push('/')">
		  <img
			  src="https://sun9-86.userapi.com/s/v1/ig2/MTDXbf8e4rG1P76_MRXjBlbCrqs576IjSBsYuukWqTgCXv2sAD5ph8bcgQhXf2KibcL8SnRfRc5C6iQZaZBEbBh9.jpg?size=649x648&quality=96&type=album"
			  alt="logo"
		  >
		</q-avatar>

		<q-toolbar-title>
		  <span class="cursor-pointer" @click="$router.push('/')">Приемная комиссия АПОУ «Вологодский колледж связи и информационных технологий»</span>
		</q-toolbar-title>

		<q-tabs class="gt-sm">
		  <navigation-routes />
		</q-tabs>

		<q-btn
			@click=" authStore.isAuthorized ? authStore.logout( $route.meta.requiresAuth ) : $router.push( { name : 'login' } ) "
			flat
			round
			dense
			:icon=" authStore.isAuthorized ? 'logout' : 'login' "
			class="q-ml-sm"
		>
		  <q-tooltip>{{ authStore.isAuthorized ? 'Выйти' : 'Авторизоваться' }}</q-tooltip>
		</q-btn>
	  </q-toolbar>
	</q-header>

	<q-drawer v-model="drawer">
	  <q-tabs vertical class="text-grey-6" active-color="indigo-4">
		<navigation-routes />
	  </q-tabs>
	</q-drawer>

	<q-page-container class="page-container">
	  <router-view />
	</q-page-container>
  </q-layout>

</template>

<style lang="scss">

.page-container {
  display: flex;
  flex-direction: column;

  @media screen and (min-width: $breakpoint-md-min) {
    align-items: center;
    justify-content: center;
  }

  min-height: 100vh;
}

</style>