import express from 'express'
import db from '../db'

const
	abiturientsRouter = express.Router()

// TODO :: check auth

// get list of abiturients

abiturientsRouter.get( '/', async ( req, res, next ) => {

	// TODO :: add pagination

	const
		{ offset, limit } = req.query

	const
		applications = db( 'abiturients as a' )
			.select( 'a.abiturient_id', 'a.first_name', 'a.last_name', 'a.middle_name', 'a.phone', 'a.email', 's.created_at' )
			.leftJoin( 'statements as s', 's.abiturient_id', 'a.abiturient_id' )
			.groupBy( 'a.abiturient_id' )

	isNaN( Number( offset ) ) || applications.offset( Number( offset ) )
	isNaN( Number( limit ) ) || applications.limit( Number( limit ) )

	res.send( { items : await applications } )

} )

// get current abiturient

abiturientsRouter.get( '/:applicationID', async ( req, res, next ) => {

	// const
	// 	{ applicationID } = req.params
	//
	// const
	// 	application = await db( 'abiturients' )
	// 		.first( '' )
	// 		.where( 'application_id', applicationID )
	//
	// res.send( { items : [ application ] } )

} )

// change abiturient data

// abiturientsRouter.put('/:applicationID')

export default abiturientsRouter