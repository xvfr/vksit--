import { createRouter, createWebHistory } from 'vue-router'

// views

import HomeView from '../views/home-view.vue'
import RatingView from '../views/rating-view.vue'
import { useAuth } from '@/stores/auth'

const
	AbiturientsView = () => import( '../views/abiturients-view.vue' ),
	AbiturientView = () => import( '../views/abiturient-view.vue' ),
	LoginView = () => import( '../views/login-view.vue' ),
	StatisticsView = () => import( '../views/statistics-view.vue' )

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
				requiresAuth : true
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
				requiresAuth : false
			}
		},
		{
			path : '/rating',
			name : 'rating',
			component : RatingView
		},
		{
			path : '/statistics',
			name : 'statistics',
			component : StatisticsView
		}
	]

	// TODO :: add error page

} )

router.beforeEach( ( to, from ) => {

	const
		authStore = useAuth()

	if ( to.meta.requiresAuth === false && authStore.isAuthorized )
		return '/'

	if ( to.meta.requiresAuth && !authStore.isAuthorized )
		return router.push( { name : 'login', query : Object.assign( from.query , { redirect : to.name } ) } )

} )

export default router
