import { defineStore } from 'pinia'
import api from '@/api'
import { Notify } from 'quasar'

interface ApplicationStatus {
	statusID : number,
	title : string,
	color : string,
	isRating : boolean,
	isRejected : boolean
}

export const useApplicationStatuses = defineStore( 'application-statuses', {

	state () {
		return {
			applicationStatuses : [] as ApplicationStatus[],

			isLoading : true,
			isError : false
		}
	},

	getters : {

		statuses : state => state.applicationStatuses

	},

	actions : {

		async get () {

			if ( this.applicationStatuses.length )
				return

			try {

				const { data : { items } } = await api.get( '/application-statuses' )

				this.applicationStatuses = items.map( ( e : any ) => ( {
					statusID : e.status_id,
					title : e.title,
					color : e.color,
					isRating : !!e.is_rating,
					isRejected : !!e.is_rejected
				} ) )

			} catch ( e ) {

				Notify.create( {
					type : 'warning',
					message : 'Не удалось загрузить список статусов заявлений',
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