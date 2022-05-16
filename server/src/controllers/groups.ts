import express from 'express'
import db from '../db'

const
	groupsRouter = express.Router()

groupsRouter.get( '/', async ( req, res, next ) => {

	const groups = await db( 'groups' )
		.select( 'group_id', 'name', 'short_name', 'code' )

	res.send( { groups } )

} )

export default groupsRouter