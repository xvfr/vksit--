import express from 'express'
import db from '../db'
import path from 'path'
import ApiError from '../errors/api'
import * as fs from 'fs'
import { isAuthorized, passedValidToken } from '../middlewares/auth'
import mailer from '../mailer'
import jwt from 'jsonwebtoken'
import { isArray } from 'util'
import disciplines from './disciplines'

const
	abiturientsRouter = express.Router()


// get abiturients count

abiturientsRouter.get( '/count', isAuthorized, async ( req, res, next ) => {

	const
		{ count } = await db( 'abiturients' )
			.first()
			.count( { count : '*' } )

	return res.send( { count } )

} )

// get list of abiturients (in admin)

abiturientsRouter.get( '/', isAuthorized, async ( req, res, next ) => {

	const
		{ offset, limit, orderBy, descending } = req.query,
		sortVector = descending === 'true' ? 'desc' : 'asc'

	const
		abiturients = db( 'abiturients as a' )
			.select( 'a.abiturient_id', 'a.first_name', 'a.last_name', 'a.middle_name', 'a.phone', 'a.email', 's.created_at', 'a.status_id', 'a.comment' )
			.leftJoin( 'statements as s', 's.abiturient_id', 'a.abiturient_id' )
			.groupBy( 'a.abiturient_id' )

	isNaN( Number( offset ) ) || abiturients.offset( Number( offset ) )
	isNaN( Number( limit ) ) || abiturients.limit( Number( limit ) )

	switch ( orderBy ) {

		case 'abiturientID':
			abiturients.orderBy( 'a.abiturient_id', sortVector )
			break

		case 'status':
			abiturients.orderBy( 'a.status_id', sortVector )
			break

		case 'fullName':
			abiturients.orderBy( [
				{
					column : 'a.first_name',
					order : sortVector
				},
				{
					column : 'a.last_name',
					order : sortVector
				},
				{
					column : 'a.middle_name',
					order : sortVector
				}
			] )
			break

		case 'createdAt':
			abiturients.orderBy( 's.created_at', sortVector )
			break

	}

	res.send( { items : await abiturients } )

} )

// get current abiturient

abiturientsRouter.get( '/:abiturientID', isAuthorized, async ( req, res, next ) => {

	const
		{ abiturientID } = req.params

	const
		abiturient = await db( 'abiturients as a' )
			.first( 'a.*', 'p.series as passport_series', 'p.number as passport_number', 'p.issued_by as passport_issued_by', 'p.issued_date as passport_issued_date', 'p.registration_address', 'p.code as passport_code', 'c.number as certificate_number', 'c.school_name', 'c.end_school_year' )
			.join( 'passports as p', 'p.passport_id', 'a.passport_id' )
			.join( 'certificates as c', 'c.certificate_id', 'a.certificate_id' )
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
		marks = await db( 'xref_abiturients_disciplines_marks as dm' )
			.select( 'dm.discipline_id', 'dm.value', 'd.name' )
			.leftJoin( 'disciplines as d', 'd.discipline_id', 'dm.discipline_id' )
			.where( 'abiturient_id', abiturientID )

	const
		photoFile = await db( 'abiturients_photos' )
			.first( 'file_id' )
			.where( 'abiturient_id', abiturientID )

	const
		extraFiles = await db( 'extra_files' )
			.select( 'file_id' )
			.where( 'abiturient_id', abiturientID )

	const
		passportsFiles = await db( 'passports_files' )
			.select( 'file_id' )
			.where( 'passport_id', abiturient.passport_id )

	const
		certificatesFiles = await db( 'certificates_files' )
			.select( 'file_id' )
			.where( 'certificate_id', abiturient.certificate_id )

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

		files = {
			photo : photoFile?.file_id || null,
			passport : passportsFiles.map( f => f.file_id ),
			certificate : certificatesFiles.map( f => f.file_id ),
			extra : extraFiles.map( f => f.file_id )
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

				status : abiturient.status_id,

				comment : abiturient.comment
			},

			passport,
			certificate,

			social_statuses : socialStatuses.map( s => s.social_status_id ),

			statements,
			files
		}

	res.send( { items : [ formattedAbiturient ] } )

} )

// get files of abiturient id

/*

 TODO : guid
 add guid for images (new field on db)??
 check guid on request (add to href)
 send or not file

 */

abiturientsRouter.get( '/:abiturientID/:fileType/:fileID', async ( req, res, next ) => {

	if ( !process.env.JWT_SECRET )
		return res.sendStatus( 500 )

	const
		{
			abiturientID,
			fileID,
			fileType
		} = req.params,
		{ token } = req.query

	if ( !token )
		return next( new ApiError( 400, 'Token must be passed' ) )

	if ( ![ 'photos', 'passports', 'certificates', 'extra' ].includes( fileType ) )
		return next( new ApiError( 400, 'Bad file type' ) )

	try {
		jwt.verify( String( token ), process.env.JWT_SECRET )
	} catch {
		return res.sendStatus( 401 )
	}

	if ( !fs.existsSync( path.join( __dirname, '..', '..', 'uploads', fileType, `${ fileID }-${ abiturientID }.jpg` ) ) )
		return res.sendStatus( 404 )

	res.sendFile( path.join( fileType, `${ fileID }-${ abiturientID }.jpg` ), { root : path.join( __dirname, '..', '..', 'uploads' ) } )

} )

abiturientsRouter.get( '/:abiturientID/:fileType/:fileID/download', async ( req, res, next ) => {

	if ( !process.env.JWT_SECRET )
		return res.sendStatus( 500 )

	const
		{
			abiturientID,
			fileID,
			fileType
		} = req.params,
		{ token } = req.query

	if ( !token )
		return next( new ApiError( 400, 'Token must be passed' ) )

	if ( ![ 'photos', 'passports', 'certificates', 'extra' ].includes( fileType ) )
		return next( new ApiError( 400, 'Bad file type' ) )

	try {
		jwt.verify( String( token ), process.env.JWT_SECRET )
	} catch {
		return res.sendStatus( 401 )
	}

	if ( !fs.existsSync( path.join( __dirname, '..', '..', 'uploads', fileType, `${ fileID }-${ abiturientID }.jpg` ) ) )
		return res.sendStatus( 404 )

	res.download( path.join( __dirname, '..', '..', 'uploads', fileType, `${ fileID }-${ abiturientID }.jpg` ), `${ fileID }-${ abiturientID }-${ fileType }.jpg` )

} )

// add new abiturient

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
			birthPlace,
			passportAddress,

			certificateNumber,
			schoolName,
			endSchoolYear,
			marksRaw,

			selectedSpecializationsRaw,
			selectedSocialStatusesRaw,
			dormitory

		} = req.body,
		{
			photo,
			passportScan,
			certificateScan,
			extraFiles
		} = req.files || {},
		isSendByAdmin = passedValidToken( req )

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

	if ( !isSendByAdmin ) {

		if ( !email || !email.trim() )
			error.add( 'E-mail', 'Обязательное поле' )

		else if ( !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/.test( email ) )
			error.add( 'E-mail', 'Некорректный e-mail' )

	}

	// photo verify

	if ( photo ) {

		if ( !( 'mimetype' in photo ) || !/^image\/.*$/.test( photo.mimetype ) )
			error.add( 'Фото', 'Типом файла может быть только изображение' )

		else if ( photo.size > 3145728 )
			error.add( 'Фото', 'Максимальный размер файла 3МБ' )

	}

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

	// birthPlace verify

	if ( !birthPlace.trim() )
		error.add( 'Место рождения', 'Обязательное поле' )

	else if ( birthPlace.length > 50 )
		error.add( 'Место рождения', 'Максимальная длина 120 символов' )

	// passportAddress verify

	if ( !passportAddress.trim() )
		error.add( 'Адрес регистрации', 'Обязательное поле' )

	else if ( passportAddress.length > 120 )
		error.add( 'Адрес регистрации', 'Максимальная длина 120 символов' )

	// passport scan

	if ( ( !passportScan || ( Array.isArray( passportScan ) && !passportScan.length ) ) && !isSendByAdmin )
		error.add( 'Скан паспорта', 'Обязательное поле' )
	else {

		if ( passportScan || Array.isArray( passportScan ) ) {

			if ( Array.isArray( passportScan ) ) {

				for ( const scan of passportScan ) {

					if ( !( 'mimetype' in scan ) || !/^image\/.*$/.test( scan.mimetype ) )
						error.add( `Скан паспорта (${ scan.name })`, 'Типом файла может быть только изображение' )

					else if ( scan.size > 3145728 )
						error.add( `Скан паспорта (${ scan.name })`, 'Максимальный размер файла 3МБ' )

				}

			} else {

				if ( !( 'mimetype' in passportScan ) || !/^image\/.*$/.test( passportScan.mimetype ) )
					error.add( 'Скан паспорта', 'Типом файла может быть только изображение' )

				else if ( passportScan.size > 3145728 )
					error.add( 'Скан паспорта', 'Максимальный размер файла 3МБ' )

			}

		}

	}

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

		// check marks count

		const
			[ { marksCount } ] = await db( 'disciplines' )
				.count( '* as marksCount' ) || {}

		if ( marks.length != marksCount )
			error.add( 'Оценки', 'Заполнены не все оценки' )

		// check passport number and series of approved abiturients

		const
			passportExists = await db( 'passports as p' )
				.first( 's.is_rating' )
				.leftJoin( 'abiturients as a', 'a.passport_id', 'p.passport_id' )
				.leftJoin( 'statuses as s', 's.status_id', 'a.status_id' )
				.where( 'p.series', passportSeries )
				.where( 'p.number', passportNumber )

		if ( passportExists?.is_rating )
			error.add( 'Паспорт', 'На данные серию и номер паспорта уже подано заявление' )

	}

	// certificate scan

	if ( ( !certificateScan || ( Array.isArray( certificateScan ) && !certificateScan.length ) ) && !isSendByAdmin )
		error.add( 'Скан аттестата', 'Обязательное поле' )
	else {

		if ( certificateScan || Array.isArray( certificateScan ) ) {

			if ( Array.isArray( certificateScan ) ) {

				for ( const scan of certificateScan ) {

					if ( !( 'mimetype' in scan ) || !/^image\/.*$/.test( scan.mimetype ) )
						error.add( `Скан аттестата (${ scan.name })`, 'Типом файла может быть только изображение' )

					else if ( scan.size > 3145728 )
						error.add( `Скан аттестата (${ scan.name })`, 'Максимальный размер файла 3МБ' )

				}

			} else {

				if ( !( 'mimetype' in certificateScan ) || !/^image\/.*$/.test( certificateScan.mimetype ) )
					error.add( 'Скан аттестата', 'Типом файла может быть только изображение' )

				else if ( certificateScan.size > 3145728 )
					error.add( 'Скан аттестата', 'Максимальный размер файла 3МБ' )

			}

		}

	}

	// -------- specializations step

	// specializations verify

	const
		selectedSpecializations = selectedSpecializationsRaw.split( ',' ).filter( ( s : number ) => s > 0 ) as number[]

	if ( !selectedSpecializations.length )
		error.add( 'Специальность', 'Необходимо выбрать хотя бы одну специальность' )

	// dormitory verify

	if ( ![ 'true', 'false' ].includes( dormitory ) )
		error.add( 'Общежитие', 'Неверное значение' )

	// extras files verify

	if ( extraFiles || Array.isArray( extraFiles ) ) {

		if ( Array.isArray( extraFiles ) ) {

			for ( const scan of extraFiles ) {

				if ( !( 'mimetype' in scan ) || !/^image\/.*$/.test( scan.mimetype ) )
					error.add( `Дополнительные файлы (${ scan.name })`, 'Типом файла может быть только изображение' )

				else if ( scan.size > 3145728 )
					error.add( `Дополнительные файлы ( (${ scan.name })`, 'Максимальный размер файла 3МБ' )

			}

		} else {

			if ( !( 'mimetype' in extraFiles ) || !/^image\/.*$/.test( extraFiles.mimetype ) )
				error.add( 'Дополнительные файлы', 'Типом файла может быть только изображение' )

			else if ( extraFiles.size > 3145728 )
				error.add( 'Дополнительные файлы', 'Максимальный размер файла 3МБ' )

		}

	}

	// throw error if exists

	if ( !error.isEmpty() )
		return next( error )

	try {

		await db.transaction( async trx => {

			const
				[ passportID ] = await trx( 'passports' )
					.insert( {
						series : passportSeries,
						number : passportNumber,
						issued_by : passportIssuedBy,
						issued_date : passportIssuedDate,
						registration_address : passportAddress,
						birth_place : birthPlace,
						code : passportCode
					} )

			const
				[ certificateID ] = await trx( 'certificates' )
					.insert( {
						number : certificateNumber,
						school_name : schoolName,
						end_school_year : endSchoolYear
					} )

			const
				[ abiturientID ] = await trx( 'abiturients' )
					.insert( {
						passport_id : passportID,
						certificate_id : certificateID,
						first_name : firstName,
						last_name : lastName,
						middle_name : middleName,
						birth_date : birthDate,
						phone : phoneNumber,
						email,
						address,
						dormitory : dormitory === 'true' ? 1 : 0
					} )

			const
				selectedSocialStatuses = selectedSocialStatusesRaw.split( ',' ).filter( ( s : number ) => s > 0 ) as number[]

			if ( selectedSocialStatuses.length ) {

				await trx( 'xref_abiturients_social_statuses' )
					.insert( selectedSocialStatuses.map( s => ( {
						abiturient_id : abiturientID,
						social_status_id : s
					} ) ) )

			}

			await trx( 'xref_abiturients_disciplines_marks' )
				.insert( marks.map( e => ( {
					abiturient_id : abiturientID,
					discipline_id : e.disciplineID,
					value : e.value
				} ) ) )

			const
				insertData = selectedSpecializations.map( group => {

					const
						disciplines = trx( 'xref_groups_disciplines' )
							.select( 'discipline_id' )
							.where( 'group_id', group )

					const
						averageScore = trx( 'xref_abiturients_disciplines_marks' )
							.first( trx.raw( 'sum(`value`) / count(*)' ) )
							.where( 'abiturient_id', abiturientID )
							.andWhere( 'discipline_id', 'in', disciplines )

					return {
						abiturient_id : abiturientID,
						group_id : group,
						average_score : averageScore
					}

				} )

			await trx('statements')
				.insert( insertData )

			if ( photo ) {

				const
					[ fileID ] = await trx( 'abiturients_photos' )
						.insert( {
							abiturient_id : abiturientID
						} )

				'mv' in photo && await photo.mv( path.join( __dirname, '..', '..', 'uploads', 'photos', `${ fileID }-${ abiturientID }.jpg` ) )

			}

			if ( passportScan || Array.isArray( passportScan ) ) {

				if ( !Array.isArray( passportScan ) ) {

					const
						[ fileID ] = await trx( 'passports_files' )
							.insert( {
								passport_id : passportID
							} )

					'mv' in passportScan && await passportScan.mv( path.join( __dirname, '..', '..', 'uploads', 'passports', `${ fileID }-${ abiturientID }.jpg` ) )

				} else {

					const
						filesCount = passportScan.length

					await trx( 'passports_files' )
						.insert( Array( filesCount ).fill( { passport_id : passportID }, 0, filesCount ) )

					const
						fileIDs = await trx( 'passports_files' )
							.select( 'file_id' )
							.where( 'passport_id', passportID )

					let i = 0

					for ( const scan of passportScan ) {
						await scan.mv( path.join( __dirname, '..', '..', 'uploads', 'passports', `${ fileIDs[ i ].file_id }-${ abiturientID }.jpg` ) )
						i++
					}

				}

			}

			if ( passportScan || Array.isArray( passportScan ) ) {

				if ( !Array.isArray( certificateScan ) ) {

					const
						[ fileID ] = await trx( 'certificates_files' )
							.insert( {
								certificate_id : certificateID
							} )

					'mv' in certificateScan && await certificateScan.mv( path.join( __dirname, '..', '..', 'uploads', 'certificates', `${ fileID }-${ abiturientID }.jpg` ) )

				} else {

					const
						filesCount = certificateScan.length

					await trx( 'certificates_files' )
						.insert( Array( filesCount ).fill( { certificate_id : certificateID }, 0, filesCount ) )

					const
						fileIDs = await trx( 'certificates_files' )
							.select( 'file_id' )
							.where( 'certificate_id', certificateID )

					let i = 0

					for ( const scan of certificateScan ) {
						await scan.mv( path.join( __dirname, '..', '..', 'uploads', 'certificates', `${ fileIDs[ i ].file_id }-${ abiturientID }.jpg` ) )
						i++
					}

				}

			}

			if ( Array.isArray( extraFiles ) || extraFiles ) {

				if ( !Array.isArray( extraFiles ) ) {

					const
						[ fileID ] = await trx( 'extra_files' )
							.insert( {
								abiturient_id : abiturientID
							} )

					'mv' in extraFiles && await extraFiles.mv( path.join( __dirname, '..', '..', 'uploads', 'extra', `${ fileID }-${ abiturientID }.jpg` ) )

				} else {

					const
						filesCount = extraFiles.length

					await trx( 'extra_files' )
						.insert( Array( filesCount ).fill( { abiturient_id : abiturientID }, 0, filesCount ) )

					const
						fileIDs = await trx( 'extra_files' )
							.select( 'file_id' )
							.where( 'abiturient_id', abiturientID )

					let i = 0

					for ( const scan of extraFiles ) {
						await scan.mv( path.join( __dirname, '..', '..', 'uploads', 'extra', `${ fileIDs[ i ].file_id }-${ abiturientID }.jpg` ) )
						i++
					}

				}

			}


		} )

	} catch ( error ) {
		console.error( new Date(), ( error as Error )?.message )
		return res.sendStatus( 500 )
	}

	res.sendStatus( 200 )

} )

// change specific abiturient data

abiturientsRouter.put( '/:abiturientID', isAuthorized, async ( req, res, next ) => {

	const
		error = new ApiError( 400, 'Bad Request' ),
		{ abiturientID } = req.params,
		{ field, payload } = req.body

	switch ( field ) {

		// change application status

		case 'status':

			const
				selectedStatus = await db( 'statuses' )
					.first( 'is_rejected', 'is_rating' )
					.where( 'status_id', payload.value )

			if ( !selectedStatus )
				error.add( 'status', 'Такого статуса не существует' )

			if ( !error.isEmpty() )
				break

			try {

				await db( 'abiturients' )
					.update( 'status_id', payload.value )
					.where( 'abiturient_id', abiturientID )

			} catch {
				error.add( 'status', 'Ошибка при записи в базу данных' )
			}

			if ( selectedStatus.is_rejected ) {

				const { email } = await db( 'abiturients' )
					.first( 'email' )
					.where( 'abiturient_id', abiturientID ) || {}

				if ( email ) {

					try {

						await mailer.sendMail( {
							from : process.env.SMTP_USER,
							to : email,
							subject : 'Заявление на обучение',
							text : 'Заявление отклонено, причина: ' + payload?.notice
						} )

					} catch ( e ) {
						console.error( new Date(), 'send-mail', e )
						error.add( 'status', 'Не удалось отправить письмо об изменении статуса' )
					}

				}

			}

			if ( selectedStatus.is_rating ) {

				const { email } = await db( 'abiturients' )
					.first( 'email' )
					.where( 'abiturient_id', abiturientID ) || {}

				if ( email ) {

					try {

						await mailer.sendMail( {
							to : email,
							from : process.env.SMTP_USER,
							subject : 'Заявление на обучение',
							text : 'Документы приняты, аттестат для зачисления нужно предоставить в приёмную комиссию до 15 августа. Время работы: ПН-ПТ с 9.00 до 15.00, адрес: Вологда, первомайская 42, каб.5\n' +
								'В случае зачисления на обучение, для оформления личного дела студента необходимо на организационное собрание группы принести: \n' +
								'1.\tБумажную папку с завязками\n' +
								'2.\tСогласие представителя субъекта персональных данных на обработку персональных данных и на передачу персональных данных третьим лицам несовершеннолетних студентов заполняет родитель/законный представитель (образец заполнения на сайте колледжа/Приёмная комиссия/бланки, документы).\n' +
								'3.\t4 фотографии 3*4\n' +
								'4.\tКопия   СНИЛС\n' +
								'5.\tКопия ИНН\n' +
								'6.\tКопия медицинского полиса\n' +
								'7.\tМедицинская справка ф.086-у с заключением о проф. пригодности П. 12 (может обучаться по специальности «…..») .\n' +
								'8.\tКопию сертификата ПФДО\n' +
								'9.\tДокументы правоустанавливающие статус сироты\\опекаемого.\n' +
								'10.\tДля инвалидов– ИПР, справка МСЭ, \n' +
								'11.\tДля лиц с ОВЗ- заключение ПМПК.\n' +
								'Характеристику из школы (по желанию)'
						} )

					} catch ( e ) {
						console.error( new Date(), 'send-mail', e )
						error.add( 'status', 'Не удалось отправить письмо об изменении статуса' )
					}

				}

			}

			break

		// set original certificate

		case 'originalCertificate':

			try {

				await db( 'statements' )
					.update( 'original_certificate', 0 )
					.where( 'abiturient_id', abiturientID )

				if ( payload.value ) {

					await db( 'statements' )
						.update( 'original_certificate', 1 )
						.where( 'statement_id', payload.value )

				}

			} catch {
				error.add( 'status', 'Ошибка при записи в базу данных' )
			}

			break

	}

	if ( !error.isEmpty() )
		return next( error )

	res.sendStatus( 204 )

} )

export default abiturientsRouter