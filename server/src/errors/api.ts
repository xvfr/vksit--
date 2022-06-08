class ApiError extends Error {

	status : number
	message : string
	description : string

	code : number

	fields : object[]

	constructor ( status : number, message : string, description : string = message, code : number = -1 ) {
		super()

		this.status = status
		this.message = message
		this.description = description

		this.code = code

		this.fields = []
	}

	add ( field : string = 'global', description : string ) {
		this.fields.push( { field, description } )
	}

	isEmpty () {
		return !this.fields.length
	}

}

export default ApiError