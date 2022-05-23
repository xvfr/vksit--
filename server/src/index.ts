// npm

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import 'dotenv/config'

// controllers

import applicationsRouter from './controllers/applications'
import groupsRouter from './controllers/groups'
import socialStatusesRouter from './controllers/social-statuses'

// app

const
	app = express()

app.use( express.json() )
app.use( cors() )

// routers
app.use( '/api/applications', applicationsRouter )
app.use( '/api/groups', groupsRouter )
app.use( '/api/social-statuses', socialStatusesRouter )

// errors check
//noinspection JSUnusedLocalSymbols
app.use( ( err : Error, req : Request, res : Response, next : NextFunction ) => {
	// res.status( err.status || 500 )
	res.status( 500 ).send( { error : err.message } )
} )

app.use( ( req, res ) => {
	res.status( 404 ).send( { error : 'Страница не найдена!' } )
} )

app.listen( process.env.PORT )