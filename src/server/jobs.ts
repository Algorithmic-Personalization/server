import {type ExecException, exec} from 'child_process';

import {type Transporter} from 'nodemailer';

import {type LogFunction} from './lib/logger';

import {type Env} from './server';
import {stringFromMaybeError} from '../util';

export type JobsContext = {
	env: Env;
	mailer: Transporter;
	mailerFrom: string;
	log: LogFunction;
};

const oneHourInMs = 60 * 60 * 1000;
const oneDayInMs = 24 * oneHourInMs;

const runAt = (hour: number, minute: number, log?: LogFunction) =>
	(fn: () => unknown, name = 'unspecified job') => {
		const now = new Date();
		const maybeNext = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
		const next = maybeNext > now ? maybeNext : new Date(maybeNext.getTime() + oneDayInMs);

		const timeout = next.getTime() - now.getTime();
		const timeoutHours = timeout / (oneHourInMs);

		log?.('info', `Scheduling ${name} to run in ${timeoutHours} hours`);

		const safeFunction = async () => {
			log?.('info', `running job ${name}`);
			try {
				await fn();
				log?.('info', `job ${name} finished`);
			} catch (err) {
				log?.('failed to run job', err);
			}
		};

		setTimeout(() => {
			void safeFunction();
			setInterval(safeFunction, oneDayInMs);
		}, timeout);
	};

export const startJobs = async ({
	log,
	env,
	mailer,
	mailerFrom,
}: JobsContext) => {
	const prefixIfDevelopment = (script: string): string => {
		if (env === 'development') {
			return `development-${script}`;
		}

		return script;
	};

	const [backupScript, uploadScript] = [
		'backup-db', 'upload-backup',
	].map(
		prefixIfDevelopment,
	);

	const combineOutput = (
		// eslint-disable-next-line @typescript-eslint/ban-types
		err: ExecException | null,
		stdout: string,
		stderr: string,
	): string =>
		[
			stringFromMaybeError(err, 'no JS error'),
			'',
			'stdout:',
			stdout,
			'',
			'stderr:',
			stderr,
		].join('\n');

	const doBackup = () => {
		log('info', 'starting backup...');
		exec(`./${backupScript}`, (err, stdout, stderr) => {
			const output = combineOutput(err, stdout, stderr);
			log(err ? 'error' : 'info', 'backup job finished', output);
			mailer.sendMail({
				from: mailerFrom,
				to: 'fm.de.jouvencel@gmail.com',
				subject: 'YTDPNL backup report',
				text: output,
			}).catch(err => {
				console.error('Failed to send backup report', err);
			});
		});
	};

	const doUploadBackup = () => {
		exec(`./${uploadScript}`, (err, stdout, stderr) => {
			log('info', 'starting upload-backup...');
			const output = combineOutput(err, stdout, stderr);
			log(err ? 'error' : 'info', 'upload-backup job finished', output);
			mailer.sendMail({
				from: mailerFrom,
				to: 'fm.de.jouvencel@gmail.com',
				subject: 'YTDPNL upload-backup report',
				text: output,
			}).catch(err => {
				console.error('Failed to send backup report', err);
			});
		});
	};

	runAt(1, 0, log)(doBackup, 'backup');
	runAt(1, 15, log)(doUploadBackup, 'upload backup');
};

export default startJobs;
