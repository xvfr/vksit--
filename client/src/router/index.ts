import { createRouter, createWebHistory } from 'vue-router'

// views

import HomeView from '../views/home-view.vue'
import RatingView from '../views/rating-view.vue'

const
	ApplicationsView = () => import( '../views/applications-view.vue' ),
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
			path : '/applications',
			name : 'applications',
			component : ApplicationsView
		},
		{
			path : '/login',
			name : 'login',
			component : LoginView
		},
		{
			path : '/rating',
			name : 'rating',
			component : RatingView
		}
	]

} )

export default router
