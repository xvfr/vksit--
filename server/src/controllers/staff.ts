import express from 'express'
import db from '../db'
import ApiError from '../errors/api'
import jwt from 'jsonwebtoken'

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
			.first( 'user_id' )
			.where( {
				login,
				password
			} )

	if ( !user )
		return res.sendStatus( 403 )

	if ( !process.env.JWT_SECRET )
		return res.sendStatus( 500 )

	const token = jwt.sign( {
		login : user.login,
		user_id : user.user_id
	}, process.env.JWT_SECRET, {
		expiresIn : '7d'
	} )

	res.send( { token } )

} )

export default staffRouter
