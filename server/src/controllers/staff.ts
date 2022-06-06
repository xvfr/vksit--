import express from 'express'
import db from '../db'

const staffRouter = express.Router()

staffRouter.post( '/auth', async ( req, res, next ) => {

	const
		{
			login,
			password
		} = req.body

	if ( !login || !password )
		return res.status( 400 ).send( { error : 'Необходимы логин и пароль!' } )

	const
		user = await db( 'staff' )
			.first( 'staff_id')
			.where( {
				login,
				password
			} )

	// TODO :: generate token

	if ( !user )
		return res.sendStatus( 401 )

	res.send( {
		token : '123123'
	} )

} )

export default staffRouter
