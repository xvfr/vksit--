import express from 'express'
import db from '../db'

const
	ratingRouter = express.Router()

// select specific group rating count statements

ratingRouter.get( '/:groupID/count', async ( req, res, next ) => {

	const
		{ groupID } = req.params

	const
		statusID = db( 'statuses' )
			.first( 'status_id' )
			.where( 'is_rating', 1 )

	const
		{ count } = await db( 'statements as s' )
			.first()
			.count( { count : '*' } )
			.leftJoin( 'abiturients as a', 'a.abiturient_id', 's.abiturient_id' )
			.where( 's.group_id', groupID )
			.andWhere( 'a.status_id', statusID )

	res.send( { count } )

} )

// select specific group rating

ratingRouter.get( '/:groupID', async ( req, res, next ) => {

	const
		{ groupID } = req.params,
		{ offset, limit, orderBy, descending } = req.query,
		sortVector = descending === 'true' ? 'desc' : 'asc'

	console.log( req.query )

	const
		statusID = db( 'statuses' )
			.first( 'status_id' )
			.where( 'is_rating', 1 )

	const
		rating = db( 'statements as s' )
			.select( 'a.abiturient_id', 's.original_certificate', 'a.first_name', 'a.last_name', 'a.middle_name', 's.average_score' )
			.leftJoin( 'abiturients as a', 'a.abiturient_id', 's.abiturient_id' )
			.where( 's.group_id', groupID )
			.andWhere( 'a.status_id', statusID )

	isNaN( Number( offset ) ) || rating.offset( Number( offset ) )
	isNaN( Number( limit ) ) || rating.limit( Number( limit ) )

	switch ( orderBy ) {

		case 'abiturientID':
			rating.orderBy( 'a.abiturient_id', sortVector )
			break

		case 'firstName':
			rating.orderBy( 'a.first_name', sortVector )
			break

		case 'lastName':
			rating.orderBy( 'a.last_name', sortVector )
			break

		case 'middleName':
			rating.orderBy( 'a.middle_name', sortVector )
			break

		case 'averageScore':
			rating.orderBy( 's.average_score', sortVector )
			break

		case 'isOriginal':
			rating.orderBy( 's.original_certificate', sortVector )
			break

	}

	res.send( { items : await rating } )

} )

export default ratingRouter