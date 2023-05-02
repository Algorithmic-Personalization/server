import {join} from 'path';
import {createWriteStream} from 'fs';

import nodemailer from 'nodemailer';

import loadConfigYamlRaw from '../server/lib/config-loader/loadConfigYamlRaw';
import getSmtpConfig from '../server/lib/config-loader/getSmtpConfig';

import startJobs, {type JobsContext} from '../server/jobs';
import {makeCreateDefaultLogger} from './../server/lib/logger';
import {findPackageJsonDir} from '../common/util';
import {logsDirName, getEnv} from '../server/server';
import {stringFromMaybeError} from '../util';

const main = async () => {
	const root = await findPackageJsonDir(__dirname);
	const logsDir = join(root, logsDirName);
	const writeStream = createWriteStream(join(logsDir, 'cron.log'), {flags: 'a'});
	const createDefaultLogger = makeCreateDefaultLogger(writeStream);
	const log = createDefaultLogger('<cron>');

	const rawConfig = await loadConfigYamlRaw();
	const smtpConfig = await getSmtpConfig(rawConfig);

	const mailer = nodemailer.createTransport(smtpConfig);

	const jobsContext: JobsContext = {
		env: getEnv(),
		mailer,
		mailerFrom: smtpConfig.auth.user,
		log,
	};

	startJobs(jobsContext).catch(err => {
		log('error', 'an error cancelled the CRONs', err);
		mailer.sendMail({
			from: smtpConfig.auth.user,
			to: 'fm.de.jouvencel@gmail.com',
			subject: 'An error cancelled the CRONs in YTDPNL',
			text: stringFromMaybeError(err),
		}).catch(err => {
			log('error', 'an error occurred while sending an error email', err);
		});
	});
};

main().catch(err => {
	console.error(
		'an error occurred in the CRONs,',
		'it should have been caught earlier,',
		'this is bad',
		err,
	);
});
