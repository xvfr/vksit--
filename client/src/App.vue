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

		<q-tabs class="gt-sm">
		  <q-route-tab to="/" label="Подача заявления" />
		  <q-route-tab to="rating" label="Рейтинг абитуриентов" />
		</q-tabs>

		<q-btn flat round dense icon="done" class="q-ml-sm" />
	  </q-toolbar>
	</q-header>

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