<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <q-layout class="shadow-2 rounded-borders">
	<q-header elevated>
	  <q-toolbar class="bg-indigo-4">
		<q-btn flat round dense icon="menu" class="q-mr-sm lt-md" />

		<q-avatar size="md" rounded class="cursor-pointer" @click="$router.push('/')">
		  <img
			  src="https://sun9-86.userapi.com/s/v1/ig2/MTDXbf8e4rG1P76_MRXjBlbCrqs576IjSBsYuukWqTgCXv2sAD5ph8bcgQhXf2KibcL8SnRfRc5C6iQZaZBEbBh9.jpg?size=649x648&quality=96&type=album">
		</q-avatar>

		<q-toolbar-title>
		  <span class="cursor-pointer" @click="$router.push('/')">АПОУ «Вологодский колледж связи и информационных технологий»</span>
		</q-toolbar-title>

		<q-tabs>
		  <q-route-tab to="/" label="Подача заявлений" />
		  <q-route-tab to="rating" label="Рейтинг абитуриентов" />
		</q-tabs>

		<q-btn flat round dense icon="done" class="q-ml-sm" />
	  </q-toolbar>
	</q-header>

	<q-page-container class="column flex-center" style="min-height: 100vh !important;">
	  <router-view />
	</q-page-container>
  </q-layout>

</template>

<script lang="ts">
export default {
	data () {
		return {}
	}
}
</script>