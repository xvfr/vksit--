import knex from 'knex'

const db = knex( {
	client : 'mysql',
	connection : {
		host : process.env.DATABASE_HOST || '127.0.0.1',
		port : 3306,
		user : process.env.DATABASE_USER,
		password : process.env.DATABASE_PASSWORD,
		database : process.env.DATABASE_NAME
	}
} )

export default db