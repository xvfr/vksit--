import axios from 'axios'
import { Notify } from 'quasar'
import { useAuth } from '@/stores/auth'

const api = axios.create( {
	baseURL : import.meta.env.VITE_API_BASE_URI
} )

api.interceptors.response.use( response => {
	return response
}, error => {

	if ( error.code === 'ERR_NETWORK' ) {

		Notify.create( {
			type : 'negative',
			message : 'Нет связи с сервером',
			caption : 'Попробуйте повторить попытку позже',

			progress : true,

			position : 'bottom-left'
		} )

	}

	if ( error.response.status === 401 ) {

		const
			authStore = useAuth()

		authStore.logout( true )

	}

	// catch 401 / 403 error
	// catch 413 error!

	return Promise.reject( error )

} )

export default api