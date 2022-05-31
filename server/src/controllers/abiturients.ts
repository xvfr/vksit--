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
		abiturients = db( 'abiturients as a' )
			.select( 'a.abiturient_id', 'a.first_name', 'a.last_name', 'a.middle_name', 'a.phone', 'a.email', 's.created_at' )
			.leftJoin( 'statements as s', 's.abiturient_id', 'a.abiturient_id' )
			.groupBy( 'a.abiturient_id' )

	isNaN( Number( offset ) ) || abiturients.offset( Number( offset ) )
	isNaN( Number( limit ) ) || abiturients.limit( Number( limit ) )

	res.send( { items : await abiturients } )

} )

// get current abiturient

abiturientsRouter.get( '/:abiturientID', async ( req, res, next ) => {

	// const
	// 	{ abiturientID } = req.params
	//
	// const
	// 	abiturient = await db( 'abiturients' )
	// 		.first( '' )
	// 		.where( 'application_id', abiturientID )
	//
	// res.send( { items : [ abiturient ] } )

} )

// change abiturient data

// abiturientsRouter.put('/:abiturientID')

export default abiturientsRouter