import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import api from '@/api'

interface Group {
	groupID : number,
	name : string,
	shortName : string,
	isPaid : boolean
}

export const useGroups = defineStore( 'groups', {

	state () {
		return {
			groups : [] as Group[],

			isLoading : true,
			isError : false
		}
	},

	actions : {

		async get () {

			if ( this.groups.length )
				return

			try {

				const { data : { items } } = await api.get( '/groups' )

				this.groups = items.map( ( e : any ) => ( {
					groupID : e.group_id,
					name : e.name,
					shortName : e.short_name,
					isPaid : !!e.is_paid
				} ) )

			} catch ( e ) {

				Notify.create( {
					type : 'warning',
					message : 'Не удалось загрузить список специальностей',
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