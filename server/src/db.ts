import knex from 'knex'

declare let process : {
	env : {
		DATABASE_HOST : string,
		DATABASE_PORT : number,
		DATABASE_USER : string,
		DATABASE_PASSWORD : string,
		DATABASE_NAME : string
	}
}

const db = knex( {
	client : 'mysql',
	connection : {
		host : process.env.DATABASE_HOST || '127.0.0.1',
		port : process.env.DATABASE_PORT || 3306,
		user : process.env.DATABASE_USER,
		password : process.env.DATABASE_PASSWORD,
		database : process.env.DATABASE_NAME
	}
} )

export default db