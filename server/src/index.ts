// npm

import express, { Request, Response, NextFunction } from 'express'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import 'dotenv/config'

// other

import ApiError from './errors/api'

// controllers

import abiturientsRouter from './controllers/abiturients'
import groupsRouter from './controllers/groups'
import socialStatusesRouter from './controllers/social-statuses'
import disciplinesRouter from './controllers/disciplines'
import staffRouter from './controllers/staff'
import ratingRouter from './controllers/rating'
import applicationsStatusesRouter from './controllers/application-statuses'
import db from './db'
import statisticsRouter from './controllers/statistics'

// app

const
	app = express()

// middlewares

app.use( express.json() )
app.use( cors() )
app.use( fileUpload( {

	limits : {
		fileSize : 5 * 1024 * 1024,
		files : 20
	},

	createParentPath : true,
	safeFileNames : true,
	abortOnLimit : true

} ) )

// routers

app.use( '/api/abiturients', abiturientsRouter )
app.use( '/api/groups', groupsRouter )
app.use( '/api/social-statuses', socialStatusesRouter )
app.use( '/api/disciplines', disciplinesRouter )
app.use( '/api/staff', staffRouter )
app.use( '/api/rating', ratingRouter )
app.use( '/api/application-statuses', applicationsStatusesRouter )
app.use( '/api/statistics', statisticsRouter )

// errors check

//noinspection JSUnusedLocalSymbols
app.use( ( err : ApiError, req : Request, res : Response, next : NextFunction ) => {
	res.status( err.status || 500 ).send( {
		error : {
			error_msg : err.message || 'Internal Server Error',
			error_description : err.description,
			error_code : err.code,
			fields : [ ...err.fields ]
		}
	} )
} )

app.use( ( req, res ) => {
	res.status( 404 ).send( { error : 'Страница не найдена!' } )
} )

app.listen( process.env.PORT )