import { createRouter, createWebHistory } from 'vue-router'

// views

import HomeView from '../views/home-view.vue'
import RatingView from '../views/rating-view.vue'

const
	AbiturientsView = () => import( '../views/abiturients-view.vue' ),
	AbiturientView = () => import( '../views/abiturient-view.vue' ),
	LoginView = () => import( '../views/login-view.vue' )

// router

const router = createRouter( {

	history : createWebHistory( import.meta.env.BASE_URL ),

	routes : [
		{
			path : '/',
			name : 'application',
			component : HomeView
		},
		{
			path : '/abiturients',
			name : 'abiturients',
			component : AbiturientsView,

			meta : {
				isAuthorized : true
			},

			children : [
				{
					path : ':id',
					name : 'abiturient',
					component : AbiturientView
				}
			]
		},
		{
			path : '/login',
			name : 'login',
			component : LoginView,

			meta : {
				isAuthorized : false
			}
		},
		{
			path : '/rating',
			name : 'rating',
			component : RatingView
		}
	]

} )

export default router
