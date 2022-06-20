import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export const isAuthorized = ( req : Request, res : Response, next : NextFunction ) => {

	if ( !process.env.JWT_SECRET )
		return res.sendStatus( 500 )

	try {

		const
			token = req.headers.authorization

		if ( !token )
			return res.sendStatus( 401 )
		else {

			const
				data = jwt.verify( token, process.env.JWT_SECRET )

			// can use user_id and login

			next()

		}

	} catch {
		return res.sendStatus( 401 )
	}

}

export const passedValidToken = ( req : Request ) => {

	if ( !process.env.JWT_SECRET )
		return false

	try {

		const
			token = req.headers.authorization

		if ( !token )
			return false
		else {

			const
				data = jwt.verify( token, process.env.JWT_SECRET )

			return true

		}

	} catch {
		return true
	}


}