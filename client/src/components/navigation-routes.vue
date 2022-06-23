<script setup lang="ts">
import { useAuth } from '@/stores/auth'

const
	authStore = useAuth()

</script>

<template>
  <q-route-tab to="/" label="Подача заявления" />
  <q-route-tab to="rating" label="Рейтинг абитуриентов" />
  <q-route-tab to="statistics" label="Статистика" />

  <q-route-tab to="abiturients" label="Обработка заявлений" v-if="authStore.isAuthorized" />
</template>