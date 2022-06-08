import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create( {
	baseURL : import.meta.env.VITE_API_BASE_URI
} )

api.interceptors.response.use( response => { return response }, error => {

	if ( error.code === 'ERR_NETWORK' ) {

		Notify.create( {
			type : 'negative',
			message : 'Нет связи с сервером',
			caption : 'Попробуйте повторить попытку позже',

			progress : true,

			position : 'bottom-left'
		} )

	}

	// catch 401 / 403 error

	return Promise.reject( error )

} )

export default api