import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import router from '@/router'
import api from '@/api'
import { AxiosError } from 'axios'

export const useAuth = defineStore( 'auth', {

	state : () => ( {
		user : localStorage.user ? JSON.parse( localStorage.user ) : null as { login : string, token : string } | null
	} ),

	getters : {
		isAuthorized : state => !!state.user
	},

	actions : {

		async authorize ( login : string, password : string, redirect = 'application' ) {

			try {

				const { data : { token } } = await api.post( '/staff/auth', {
					login,
					password
				} )

				if ( !token || typeof token !== 'string' )
					return Notify.create( {
						type : 'negative',
						message : 'При обработке запроса произошла серверная ошибка',
						caption : 'Попробуйте повторить попытку позже',

						progress : true,

						position : 'bottom-left'
					} )

				this.user = {
					login,
					token
				}

				Notify.create( {
					type : 'positive',
					message : 'Вы успешно авторизовались!',

					progress : true,

					position : 'bottom-left'
				} )

				api.defaults.headers.common['Authorization'] = token
				localStorage.user = JSON.stringify( this.user )
				router.push( { name : redirect } )

			} catch ( e ) {

				if ( e instanceof AxiosError && e.response?.status === 403 )
					Notify.create( {
						type : 'warning',
						message : 'Неверный логин или пароль!',

						progress : true,

						position : 'bottom-left'
					} )

			}

		},

		logout ( requiresAuth : boolean ) {

			this.user = null
			delete localStorage.user
			delete api.defaults.headers.common['Authorization']

			Notify.create( {
				message : 'Вы успешно вышли!',
				progress : true,
				position : 'bottom-left'
			} )

			if ( requiresAuth )
				router.push( { name : 'login' } )

		}

	}

} )