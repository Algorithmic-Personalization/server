import React, {useState} from 'react';
import {useParams} from 'react-router';

import {
	Box,
	Button,
	FormControl,
	InputLabel,
	Input,
} from '@mui/material';

import {Link} from 'react-router-dom';

import NotificationsC, {type Message} from './shared/NotificationsC';

import {bind} from './shared/util';

import {useAdminApi} from '../adminApiProvider';

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
	const [loginText, setLoginText] = useState<string>('Login instead');
	const [confirm, setConfirm] = useState<string>('');
	const [message, setMessage] = useState<Message>();
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const {token} = useParams();

	if (!token || typeof token !== 'string') {
		return (
			<Box sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'top',
				mt: 6,
			}}>
				<Box>
					<h1>Invalid token</h1>
					<p>Sorry...</p>
				</Box>
			</Box>
		);
	}

	const api = useAdminApi();

	const tryToRegister = () => {
		(async () => {
			const errors: string[] = [];

			if (password !== confirm) {
				errors.push('Passwords should match');
			}

			if (errors.length > 0) {
				setMessage({
					text: errors,
					severity: 'error',
				});
				return;
			}

			setIsSubmitting(true);
			const result = await api.resetPassword(token, email, password);
			setIsSubmitting(false);

			if (result.kind === 'Success' && result.value) {
				setLoginText('Go to log-in');
				setMessage({
					text: 'Password reset successfully, you can now log-in!',
					severity: 'success',
				});
			} else {
				setMessage({
					text: result.kind === 'Failure'
						? result.message
						: 'Something went wrong while attempting to reset your password, sorry.',
					severity: 'error',
				});
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
				<h1>Reset your password</h1>

				<NotificationsC message={message}/>

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
					Reset my password
				</Button>

				<Box sx={{mt: 2}}>
					<Link to='/'>{loginText}</Link>
				</Box>
			</form>
		</Box>
	);

	return ui;
};

export default RegisterC;
