import express from 'express'
import db from '../db'
import path from 'path'

const
	abiturientsRouter = express.Router()

// get list of abiturients (in admin)

// TODO :: add auth middleware

abiturientsRouter.get( '/', async ( req, res, next ) => {

	// TODO :: add pagination

	const
		{ offset, limit } = req.query

	const
		abiturients = db( 'abiturients as a' )
			.select( 'a.abiturient_id', 'a.first_name', 'a.last_name', 'a.middle_name', 'a.phone', 'a.email', 's.created_at', 'a.status_id', 'st.title', 'st.color', 'a.comment' )
			.leftJoin( 'statements as s', 's.abiturient_id', 'a.abiturient_id' )
			.leftJoin( 'statuses as st', 'st.status_id', 'a.status_id' )
			.groupBy( 'a.abiturient_id' )

	isNaN( Number( offset ) ) || abiturients.offset( Number( offset ) )
	isNaN( Number( limit ) ) || abiturients.limit( Number( limit ) )

	res.send( { items : await abiturients } )

} )

// get current abiturient

// TODO :: add auth middleware

abiturientsRouter.get( '/:abiturientID', async ( req, res, next ) => {

	const
		{ abiturientID } = req.params

	const
		abiturient = await db( 'abiturients as a' )
			.first( 'a.*', 'p.series as passport_series', 'p.number as passport_number', 'p.issued_by as passport_issued_by', 'p.issued_date as passport_issued_date', 'p.registration_address', 'p.code as passport_code', 'c.number as certificate_number', 'c.school_name', 'c.issued_date as certificate_issued_date', 'c.end_school_year', 's.title', 's.color' )
			.join( 'passports as p', 'p.passport_id', 'a.passport_id' )
			.join( 'certificates as c', 'c.certificate_id', 'a.certificate_id' )
			.leftJoin( 'statuses as s', 's.status_id', 'a.status_id' )
			.where( 'abiturient_id', abiturientID )

	if ( !abiturient )
		return res.sendStatus( 404 )

	const
		socialStatuses = await db( 'xref_abiturients_social_statuses' )
			.select( 'social_status_id' )
			.where( 'abiturient_id', abiturientID )

	const
		statements = await db( 'statements' )
			.select( 'statement_id', 'group_id', 'created_at', 'original_certificate', 'average_score' )
			.where( 'abiturient_id', abiturientID )

	statements.forEach( s => s.original_certificate = !!s.original_certificate )

	const
		marks = await db( 'xref_abiturients_disciplines_marks' )
			.select( 'descipline_id', 'mark' )
			.where( 'abiturient_id', abiturientID )

	// TODO :: get abit files ids

	const
		passport = {
			id : abiturient.passport_id,
			series : abiturient.passport_series,
			number : abiturient.passport_number,
			issued_date : abiturient.passport_issued_date,
			issued_by : abiturient.passport_issued_by,
			registration_address : abiturient.registration_address,
			code : abiturient.passport_code
		},

		certificate = {
			id : abiturient.certificate_id,
			number : abiturient.certificate_number,
			school_name : abiturient.school_name,
			issued_date : abiturient.certificate_issued_date,
			end_school_year : abiturient.end_school_year,

			marks
		},

		formattedAbiturient = {
			abiturient : {
				id : abiturient.abiturient_id,
				first_name : abiturient.first_name,
				last_name : abiturient.last_name,
				middle_name : abiturient.middle_name,
				birth_date : abiturient.birth_date,
				birth_place : abiturient.birth_place,
				phone : abiturient.phone,
				email : abiturient.email,
				address : abiturient.address,
				dormitory : !!abiturient.dormitory,

				status : {
					id : abiturient.status_id,
					title : abiturient.title,
					color : abiturient.color
				},

				comment : abiturient.comment
			},
			passport,
			certificate,

			social_statuses : socialStatuses.map( s => s.social_status_id ),

			statements : statements
		}

	res.send( { items : [ formattedAbiturient ] } )

} )

// get files of abiturient id

abiturientsRouter.get( '/:abiturientID/:fileType/:fileID', async ( req, res, next ) => {

	const
		{ fileType } = req.params

	res.sendFile( path.join( fileType, '1-1.jpg' ), { root : path.join( __dirname, '..', '..', 'uploads' ) } )

} )

// add new abiturient

abiturientsRouter.post( '/', async ( req, res, next ) => {

	console.log( req.body )
	console.log( req.files )

} )

// change abiturient data

// abiturientsRouter.put('/:abiturientID')

export default abiturientsRouter