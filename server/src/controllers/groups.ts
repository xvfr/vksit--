import express from 'express'
import db from '../db'

const
	groupsRouter = express.Router()

groupsRouter.get( '/', async ( req, res, next ) => {

	const
		groups = await db( 'groups' )
			.select( 'group_id', 'name', 'short_name' )

	const
		formattedGroups = groups.map( g => ( {
			groupID : g.group_id,
			name : g.name,
			shortName : g.short_name
		} ) )

	res.send( { groups : formattedGroups } )

} )

export default groupsRouter