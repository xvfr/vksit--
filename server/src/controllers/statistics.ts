import express from 'express'
import db from '../db'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import weekday from 'dayjs/plugin/weekday'

dayjs.locale( 'ru' )
dayjs.extend( weekday )

const statisticsRouter = express.Router()

statisticsRouter.get( '/', async ( req, res, next ) => {

	const
		lastWeekStart = dayjs().weekday( -7 ),
		lastWeekEnd = dayjs().weekday( -1 ),
		monday = dayjs().weekday( 0 ),
		tuesday = dayjs().weekday( 1 ),
		wednesday = dayjs().weekday( 2 ),
		thursday = dayjs().weekday( 3 ),
		friday = dayjs().weekday( 4 ),
		saturday = dayjs().weekday( 5 ),
		sunday = dayjs().weekday( 6 )

	const
		lastWeek = db( 'statements' )
			.select( 'group_id' )
			.count( '* as count' )
			.whereBetween( 'created_at', [ lastWeekStart.format( 'YYYY-MM-DD' ), lastWeekEnd.add( 1, 'd' ).format( 'YYYY-MM-DD' ) ] )
			.groupBy( 'group_id' )

	const
		statistics = await db( 'statements' )
			.select( 'group_id', db.raw( 'DATE(??) as date', 'created_at' ) )
			.count( 'abiturient_id as count' )
			.whereBetween( 'created_at', [ monday.format( 'YYYY-MM-DD' ), sunday.add( 1, 'd' ).format( 'YYYY-MM-DD' ) ] )
			.groupBy( 'group_id', db.raw( 'DATE(??)', 'created_at' ) )

	const
		mon = [],
		tue = [],
		wed = [],
		thur = [],
		fri = [],
		sat = [],
		sun = []

	for ( const stat of statistics ) {

		if ( dayjs( stat.date ).day() === monday.day() ) {
			mon.push( stat )
		}

		if ( dayjs( stat.date ).day() === tuesday.day() ) {
			tue.push( stat )
		}

		if ( dayjs( stat.date ).day() === wednesday.day() ) {
			wed.push( stat )
		}

		if ( dayjs( stat.date ).day() === thursday.day() ) {
			thur.push( stat )
		}

		if ( dayjs( stat.date ).day() === friday.day() ) {
			fri.push( stat )
		}

		if ( dayjs( stat.date ).day() === saturday.day() ) {
			sat.push( stat )
		}

		if ( dayjs( stat.date ).day() === sunday.day() ) {
			sun.push( stat )
		}

	}

	res.send( {
		items : [
			{
				field : 'lastWeek',
				label : `${ lastWeekStart.format( 'D/M' ) } - ${ lastWeekEnd.format( 'D/M' ) }`,
				data : await lastWeek
			},
			{
				field : 'monday',
				label : monday.format( 'D/M' ),
				data : mon
			},
			{
				field : 'tuesday',
				label : tuesday.format( 'D/M' ),
				data : tue
			},
			{
				field : 'wednesday',
				label : wednesday.format( 'D/M' ),
				data : wed
			},
			{
				field : 'thursday',
				label : thursday.format( 'D/M' ),
				data : thur
			},
			{
				field : 'friday',
				label : friday.format( 'D/M' ),
				data : fri
			},
			{
				field : 'saturday',
				label : saturday.format( 'D/M' ),
				data : sat
			},
			{
				field : 'sunday',
				label : sunday.format( 'D/M' ),
				data : sun
			}
		]
	} )

} )

export default statisticsRouter