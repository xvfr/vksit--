import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import api from '@/api'

interface SocialStatus {
	statusID : number,
	title : string
}

export const useSocialStatuses = defineStore( 'social-statuses', {

	state () {
		return {
			socialStatuses : [] as SocialStatus[],

			isLoading : true,
			isError : false
		}
	},

	actions : {

		async get () {

			if ( this.socialStatuses.length )
				return

			try {

				const { data : { items } } = await api.get( '/social-statuses' )

				this.socialStatuses.push(

					...items.map( ( e : any ) => ( {
						statusID : e.social_status_id,
						title : e.title
					} ) )

				)

			} catch ( e ) {

				Notify.create( {
					type : 'warning',
					message : 'Не удалось загрузить список социальных статусов',
					caption : 'Попробуйте повторить попытку позже',

					progress : true,

					position : 'bottom-left'
				} )

				this.isError = true

			}

			this.isLoading = false

		}
	}

} )