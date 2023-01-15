import {IsPositive, IsNotEmpty, IsString, IsBoolean, ValidateNested} from 'class-validator';

class SmtpAuth {
	@IsNotEmpty()
	@IsString()
		user = '';

	@IsNotEmpty()
	@IsString()
		pass = '';
}

export class SmtpConfig {
	@ValidateNested()
		auth: SmtpAuth = new SmtpAuth();

	@IsNotEmpty()
	@IsString()
		host = '';

	@IsPositive()
		port = 0;

	@IsBoolean()
		secure = true;
}

export default SmtpConfig;
