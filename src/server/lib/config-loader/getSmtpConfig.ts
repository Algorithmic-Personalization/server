import {validate} from 'class-validator';
import {has} from '../../../common/util';
import SmtpConfig from '../smtpConfig';
import ensureRecord from './ensureRecord';

export const getSmtpConfig = async (config: unknown): Promise<SmtpConfig> => {
	ensureRecord(config);

	if (!has('smtp')(config)) {
		throw new Error('Missing smtp config in config.yml');
	}

	const smtpConfig = new SmtpConfig();
	Object.assign(smtpConfig, config.smtp);

	const smtpConfigErrors = await validate(smtpConfig);

	if (smtpConfigErrors.length > 0) {
		console.error('Invalid smtp config in config.yml', smtpConfigErrors);
		process.exit(1);
	}

	return smtpConfig;
};

export default getSmtpConfig;
