import {has} from '../../../common/util';
import config from '../../../../config.extension';

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
if (!has(`${env}-server-url`)(config)) {
	throw new Error(`Missing ${env}-server-url in config`);
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API URL:', config[`${env}-server-url`]);

export const serverUrl = config[`${env}-server-url`];
export default serverUrl;
