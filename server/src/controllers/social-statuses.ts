import express from 'express'
import db from '../db'

const
	socialStatusesRouter = express.Router()

socialStatusesRouter.get( '/', async ( req, res, next ) => {

	const
		socialStatuses = await db( 'social_statuses' )
			.select( 'social_status_id', 'title' )

	const
		formattedSocialStatuses = socialStatuses.map( ss => ( {
			statusID : ss.social_status_id,
			title : ss.title
		} ) )

	res.send( { socialStatuses : formattedSocialStatuses } )

} )

export default socialStatusesRouter