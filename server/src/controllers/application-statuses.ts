import express from 'express'
import db from '../db'
import { isAuthorized } from '../middlewares/auth'

const
	applicationsStatusesRouter = express.Router()

applicationsStatusesRouter.get( '/', isAuthorized, async ( req, res, next ) => {

	const
		socialStatuses = await db( 'statuses' )
			.select( 'status_id', 'title', 'color', 'is_rating', 'is_rejected' )

	res.send( { items : socialStatuses } )

} )

export default applicationsStatusesRouter