import React, {useState} from 'react';

import {
	Box,
	Button,
	FormControl,
	InputLabel,
	Input,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';

import RedirectMessageC from './shared/RedirectMessageC';
import NotificationsC, {type Message} from './shared/NotificationsC';

import {bind} from './shared/util';

export const ForgotP: React.FC<{
	email: string;
	password: string;
	setEmail: (email: string) => void;
	setPassword: (password: string) => void;
}> = ({
	email,
	setEmail,
}) => {
	const [message, setMessage] = useState<Message>();
	const api = useAdminApi();

	const sendResetLink = async () => {
		if (!email) {
			setMessage({
				text: 'Please enter your email address.',
				severity: 'error',
			});
			return;
		}

		try {
			await api.sendAdminPasswordResetLink(email);
			setMessage({
				text: 'A password reset link has been sent to your email address if an account is already associated to it. It will be valid for 24 hours.',
				severity: 'success',
			});
		} catch (e) {
			setMessage({
				text: 'Something went wrong while attempting to send password reset link, sorry. Pray.',
				severity: 'error',
			});
		}

		return true;
	};

	const ui = (
		<Box sx={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'top',
			mt: 6,
		}}>
			<form onSubmit={async e => {
				e.preventDefault();
				await sendResetLink();
			}}>
				<h1>Reset your Password</h1>

				<RedirectMessageC />
				<NotificationsC message={message}/>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='email'>Email</InputLabel>
					<Input id='email' type='email' {...bind(email, setEmail)}/>
				</FormControl>

				<Button type='submit' variant='contained' sx={{mt: 2}}>
					Send me a link
				</Button>
			</form>
		</Box>
	);

	return ui;
};

export default ForgotP;
