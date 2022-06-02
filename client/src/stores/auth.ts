import { defineStore } from 'pinia'

export const useAuth = defineStore( 'auth', {

	state : () => ( {

		user : localStorage.user ? JSON.parse( localStorage.user ) : null

	} ),

	actions : {

		authorize ( login : string, password : string ) {



			localStorage.user = JSON.stringify( this.user )
		},

		logout () {

			this.user = null
			delete localStorage.user
		}

	}

} )