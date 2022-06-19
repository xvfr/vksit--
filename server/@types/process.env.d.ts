declare let process : {
	env : {
		DATABASE_HOST : string,
		DATABASE_USER : string,
		DATABASE_PASSWORD : string,
		DATABASE_NAME : string,

		PORT : number,

		JWT_SECRET : string,

		SMTP_HOST : string,
		SMTP_PORT ?: number,
		SMTP_USER : string,
		SMTP_PASSWORD : string
	}
}