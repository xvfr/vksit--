import express from 'express'
import db from '../db'
import ApiError from '../errors/api'

const staffRouter = express.Router()

staffRouter.post( '/auth', async ( req, res, next ) => {

	const {
		login,
		password
	} = req.body

	if ( !login || !password )
		return next( new ApiError( 400, 'Необходимы логин и пароль!' ) )

	const
		user = await db( 'staff' )
			.first( 'staff_id' )
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
