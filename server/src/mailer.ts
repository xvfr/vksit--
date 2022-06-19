import nodemailer from 'nodemailer'

const mailer = nodemailer.createTransport( {

	host : process.env.SMTP_HOST,
	port : Number( process.env.SMTP_PORT ) || 587,
	auth : {
		user : process.env.SMTP_USER,
		pass : process.env.SMTP_PASSWORD
	}

} )

export default mailer