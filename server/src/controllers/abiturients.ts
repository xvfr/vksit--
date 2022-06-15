import express from 'express'
import db from '../db'
import path from 'path'
import ApiError from '../errors/api'
import disciplines from './disciplines'
import { markAsUntransferable } from 'worker_threads'

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
			.first( 'a.*', 'p.series as passport_series', 'p.number as passport_number', 'p.issued_by as passport_issued_by', 'p.issued_date as passport_issued_date', 'p.registration_address', 'p.code as passport_code', 'c.number as certificate_number', 'c.school_name', 'c.end_school_year', 's.title', 's.color' )
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

// TODO :: add auth middleware

abiturientsRouter.get( '/:abiturientID/:fileType/:fileID', async ( req, res, next ) => {

	const
		{ fileType } = req.params

	res.sendFile( path.join( fileType, '1-1.jpg' ), { root : path.join( __dirname, '..', '..', 'uploads' ) } )

} )

// add new abiturient

// TODO :: add auth middleware

abiturientsRouter.post( '/', async ( req, res, next ) => {

	const
		error = new ApiError( 400, 'Bad Request' ),
		{
			firstName,
			lastName,
			middleName,
			birthDate,
			address,
			phoneNumber,
			email,

			passportSeries,
			passportNumber,
			passportIssuedDate,
			passportIssuedBy,
			passportCode,
			passportAddress,

			certificateNumber,
			schoolName,
			endSchoolYear,
			marksRaw,

			selectedSpecializationsRaw,
			selectedSocialStatusesRaw,
			dormitory

		} = req.body

	// ----------- basic

	// first name verify

	if ( !firstName )
		error.add( 'Имя', 'Обязательное поле' )

	else if ( firstName.length > 30 )
		error.add( 'Имя', 'Должно содержать не более 30 символов' )

	else if ( !/^[А-ЯЁёа-я]+$/.test( firstName ) )
		error.add( 'Имя', 'Должно содержать только кириллицу без пробелов' )

	// last name verify

	if ( !lastName )
		error.add( 'Фамилия', 'Обязательное поле' )

	else if ( lastName.length > 30 )
		error.add( 'Фамилия', 'Должна содержать не более 30 символов' )

	else if ( !/^[А-ЯЁёа-я]+$/.test( lastName ) )
		error.add( 'Фамилия', 'Должна содержать только кириллицу без пробелов' )

	if ( !!middleName ) {

		if ( middleName.length > 30 )
			error.add( 'Отчество', 'Максимальная длина 30 символов' )

		else if ( !/^[А-ЯЁёа-я]+$/.test( middleName ) )
			error.add( 'Отчество', 'Должно содержать только кириллицу без пробелов' )

	}

	// birthdate verify

	if ( !birthDate )
		error.add( 'Дата рождения', 'Обязательное поле' )

	else if ( isNaN( Date.parse( birthDate ) ) )
		error.add( 'Дата рождения', 'Некорректная дата рождения' )

	// address verify

	if ( !address.trim() )
		error.add( 'Адрес', 'Обязательное поле' )

	else if ( address.length > 120 )
		error.add( 'Адрес', 'Максимальная длина 120 символов' )


	// phoneNumber verify

	if ( !phoneNumber.trim() )
		error.add( 'Номер телефона', 'Обязательное поле' )

	else if ( !/^\(\d{3}\)\s\d{3}\s-\s\d{4}$/.test( phoneNumber ) )
		error.add( 'Номер телефона', 'Некорректный номер телефона' )

	// email verify

	if ( !email.trim() )
		error.add( 'E-mail', 'Обязательное поле' )

	else if ( !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/.test( email ) )
		error.add( 'E-mail', 'Некорректный e-mail' )

	// ----------- passport

	// passportSeries verify

	if ( !passportSeries.trim() )
		error.add( 'Серия паспорта', 'Обязательное поле' )

	else if ( !/^\d{4}$/.test( passportSeries ) )
		error.add( 'Серия паспорта', 'Некорректная серия' )

	// passportNumber verify

	if ( !passportNumber.trim() )
		error.add( 'Номер паспорта', 'Обязательное поле' )

	else if ( !/^\d{6}$/.test( passportNumber ) )
		error.add( 'Номер паспорта', 'Некорректный номер' )

	// passportIssuedDate verify

	if ( !passportIssuedDate )
		error.add( 'Дата выдачи паспорта', 'Обязательное поле' )

	else if ( isNaN( Date.parse( passportIssuedDate ) ) )
		error.add( 'Дата выдачи паспорта', 'Некорректная дата выдачи' )

	// passportIssuedBy verify

	if ( !passportIssuedBy.trim() )
		error.add( 'Кем выдан паспорт', 'Обязательное поле' )

	else if ( passportIssuedBy.length > 120 )
		error.add( 'Кем выдан паспорт', 'Максимальная длина 120 символов' )

	// passportCode verify

	if ( !passportCode.trim() )
		error.add( 'Код подразделения', 'Обязательное поле' )

	else if ( !/^\d{6}$/.test( passportCode ) )
		error.add( 'Код подразделения', 'Некорректный код' )

	// passportAddress verify

	if ( !passportAddress.trim() )
		error.add( 'Адрес регистрации', 'Обязательное поле' )

	else if ( passportAddress.length > 120 )
		error.add( 'Адрес регистрации', 'Максимальная длина 120 символов' )

	// --------- certificate

	// certificateNumber verify

	if ( !certificateNumber.trim() )
		error.add( 'Номер аттестата', 'Обязательное поле' )

	else if ( !/^\d{14}$/.test( certificateNumber ) )
		error.add( 'Номер аттестата', 'Некорректный номер' )

	// schoolName verify

	if ( !schoolName.trim() )
		error.add( 'Название школы', 'Обязательное поле' )

	else if ( schoolName.length > 75 )
		error.add( 'Название школы', 'Максимальная длина 75 символов' )

	// endSchoolYear verify

	if ( !endSchoolYear.trim() )
		error.add( 'Год окончания школы', 'Обязательное поле' )

	else if ( !/^\d{4}$/.test( endSchoolYear ) ) {
		error.add( 'Год окончания школы', 'Некорректный год окончания' )
	}

	// marks verify

	const
		marks = JSON.parse( marksRaw ) as { disciplineID : number, value : number }[]

	for ( const mark of marks ) {

		if ( !mark.disciplineID || isNaN( Number( mark.disciplineID ) ) )
			error.add( 'Оценки', 'Неверный идентификатор дисциплины' )

		if ( !mark.value || isNaN( Number( mark.value ) ) || mark.value > 5 || mark.value < 1 )
			error.add( 'Оценки', 'Неверное значение' )

	}

	// for less server load

	if ( error.isEmpty() ) {

		const
			[ { marksCount } ] = await db( 'disciplines' )
				.count( '* as marksCount' ) || {}

		// check marks count db

		// console.log( marks.length )
		// console.log( marksCount )
		// console.log( marks.length === marksCount )

	}

	// -------- specializations step

	// specializations verify

	const
		selectedSpecializations = req.body.selectedSpecializationsRaw.split( ',' ).filter( ( s : number ) => s > 0 ) as number[]

	if ( !selectedSpecializations.length )
		error.add( 'Специальность', 'Необходимо выбрать хотя бы одну специальность' )

	// dormitory verify

	if ( ![ 'true', 'false' ].includes( dormitory ) )
		error.add( 'Общежитие', 'Неверное значение' )

	// throw error if exists

	if ( !error.isEmpty() )
		return next( error )

	// const ids = await db( 'statements' )
	// 	.insert( [
	// 		{
	// 			abiturient_id : 1,
	// 			group_id : 103,
	// 			average_score : 1.23
	// 		},
	// 		{
	// 			abiturient_id : 1,
	// 			group_id : 2,
	// 			average_score : 1.23
	// 		}
	// 	] )
	// 	.onConflict()
	// 	.ignore()

	// const
	// 	passportID = await db( 'passports' )
	// 		.insert( {
	// 			series : passportSeries,
	// 			number : passportNumber,
	// 			issued_by : passportIssuedBy,
	// 			issued_date : passportIssuedDate,
	// 			registration_address : passportAddress,
	// 			code : passportCode
	// 		} )
	//
	// const
	// 	certificateID = await db( 'certificates' )
	// 		.insert( {
	// 			number : certificateNumber,
	// 			school_name : schoolName,
	// 			end_school_year : endSchoolYear
	// 		} )

	// const
	// 	abiturientID = await db('abiturients')
	// 		.insert({
	// 			passport_id : passportID,
	// 			certificate_id : certificateID,
	// 			first_name : firstName,
	// 			last_name : lastName,
	// 			middle_name : middleName,
	// 			birth_date : birthDate,
	// 			phone : phoneNumber,
	// 			email,
	// 			address,
	// 			dormitory : dormitory === 'true' ? 1 : 0
	// 		})

	const
		selectedSocialStatuses = selectedSocialStatusesRaw.split( ',' ).filter( ( s : number ) => s > 0 ) as number[]

	if ( selectedSocialStatuses.length ) {

		// await db('xref_abiturients_social_statuses')
		// 	.insert( selectedSocialStatuses.map( s => ({
		// 		abiturient_id : abiturientID,
		// 		social_status_id : s
		// 	})) )
		// 	.onConflict()
		// 	.ignore()

	}

	// await db( 'xref_abiturients_disciplines_marks' )
	// 	.insert( marks.map( e => ( {
	// 		abiturient_id : abiturientID,
	// 		discipline_id : e.disciplineID,
	// 		mark : e.value
	// 	} ) ) )
	// 	.onConflict()
	// 	.merge()

	const applications = await db( 'statements' )
		.insert( selectedSpecializations.map( s => ( {
			abiturient_id : 2,
			group_id : s,
			// average_score : 1.0
		} ) ) )
		.onConflict()
		.ignore()

	console.log( applications )

	// check average score!!!
	// check files size
	// check files type
	// check passport number and series of approved abiturients
	// save files
	// add to db
	// create applications
	// create other documents
	// send mail

	// console.log( req.body )
	// console.log( req.files )

	res.status( 200 ).send( { id : 1 } )

} )

// change specific abiturient data

// TODO :: add auth middleware

// abiturientsRouter.put('/:abiturientID')

export default abiturientsRouter