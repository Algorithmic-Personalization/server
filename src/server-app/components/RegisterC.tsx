import React, {useState} from 'react';

import {
	Box,
	Button,
	FormControl,
	InputLabel,
	Input,
} from '@mui/material';

import {Link} from 'react-router-dom';

import Admin from '../../common/models/admin';

import MessageC from './MessageC';
import ErrorsC from './ErrorsC';

import {bind} from './helpers';

import {useAdminApi} from '../adminApiProvider';

import {validateExcept} from '../../common/util';

const validate = validateExcept('id', 'verificationToken');

export const RegisterC: React.FC<{
	email: string;
	password: string;
	setEmail: (email: string) => void;
	setPassword: (password: string) => void;
}> = ({
	email,
	setEmail,
	password,
	setPassword,
}) => {
	const [confirm, setConfirm] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [errors, setErrors] = useState<string[]>([]);
	const [success, setSuccess] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const api = useAdminApi();

	const tryToRegister = () => {
		(async () => {
			const admin = new Admin();
			Object.assign(admin, {
				name,
				email,
				password,
			});

			const validationErrors = await validate(admin);

			if (password !== confirm) {
				validationErrors.push('Passwords should match');
			}

			if (validationErrors.length > 0) {
				setErrors(validationErrors);
				return;
			}

			setErrors([]);

			setIsSubmitting(true);
			const result = await api.register(admin);
			setIsSubmitting(false);

			if (result.kind === 'Success') {
				setSuccess(result.value);
			} else {
				setErrors([result.message]);
			}
		})();
	};

	const ui = (
		<Box sx={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'top',
			mt: 6,
		}}>
			<form onSubmit={e => {
				console.log('submit');
				tryToRegister();
				e.preventDefault();
			}}>
				<h1>Admin registration</h1>

				<ErrorsC errors={errors}/>
				<MessageC message={success} type='success'/>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='name'>Name</InputLabel>
					<Input id='name' type='text' {...bind(name, setName)}/>
				</FormControl>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='email'>Email</InputLabel>
					<Input id='email' type='email' {...bind(email, setEmail)}/>
				</FormControl>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='password'>Password</InputLabel>
					<Input id='password' type='password' {...bind(password, setPassword)}/>
				</FormControl>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='confirm'>Password confirmation</InputLabel>
					<Input id='confirm' type='password' {...bind(confirm, setConfirm)}/>
				</FormControl>

				<Button type='submit' variant='contained' sx={{mt: 2}} disabled={isSubmitting}>
					Register
				</Button>

				<Box sx={{mt: 2}}>
					<Link to='/'>Login instead</Link>
				</Box>
			</form>
		</Box>
	);

	return ui;
};

export default RegisterC;
