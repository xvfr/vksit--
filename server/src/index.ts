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

// app

const
	app = express()

app.use( express.json() )
app.use( cors() )
app.use( fileUpload() )

// routers
app.use( '/api/abiturients', abiturientsRouter )
app.use( '/api/groups', groupsRouter )
app.use( '/api/social-statuses', socialStatusesRouter )
app.use( '/api/disciplines', disciplinesRouter )
app.use( '/api/staff', staffRouter )

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