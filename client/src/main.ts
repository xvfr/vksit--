// vue
import App from './App.vue'
import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'

// quasar
import { Notify, Quasar } from 'quasar'
import quasarLang from 'quasar/lang/ru'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

const app = createApp( App )

app.use( createPinia() )
app.use( router )
app.use( Quasar, {
	plugins : {
		Notify
	},
	lang : quasarLang
} )

app.mount( '#app' )
