import express from 'express'
import db from '../db'

const
	disciplinesRouter = express.Router()

disciplinesRouter.get( '/', async ( req, res, next ) => {

	const
		disciplines = await db( 'disciplines' )
			.select()

	res.send( { items : disciplines } )

} )

export default disciplinesRouter