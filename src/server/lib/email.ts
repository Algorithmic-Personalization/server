import {type Transporter} from 'nodemailer';
import {type LogFunction} from './logger';
import {inspect} from 'util';

export type MailServiceDependencies = {
	transport: Transporter;
	from: string;
	log: LogFunction;
};

type MailerInput = {
	to: string;
	subject: string;
	text: string;
	html?: string;
};

export type MailService = (data: MailerInput) => Promise<boolean>;

export const createMailService = (deps: MailServiceDependencies): MailService => async ({
	to, subject, text, html,
}) => {
	try {
		await deps.transport.sendMail({
			from: deps.from,
			to,
			subject,
			text,
			html: html ?? `<pre>${text}</pre>`,
		});
		return true;
	} catch (err) {
		deps.log('error', 'while sending an email', [
			`from ${deps.from} to ${to}`,
			`subject: ${subject}`,
			`text: ${text}`,
			`html: ${html ?? '<none>'}`,
			`error: ${inspect(err)}`,
		]);
		return false;
	}
};
