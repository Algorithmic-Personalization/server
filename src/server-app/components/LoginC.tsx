import React, {useState} from 'react';

import {Link, useNavigate} from 'react-router-dom';

import {
	Box,
	Button,
	FormControl,
	InputLabel,
	Input,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';

import RedirectMessageC from './RedirectMessageC';
import MessageC from './MessageC';

import {bind} from './helpers';

export const LoginC: React.FC<{
	email: string;
	password: string;
	setEmail: (email: string) => void;
	setPassword: (password: string) => void;
	onSuccess?: () => void;
	isModal?: boolean;
}> = ({
	email,
	setEmail,
	password,
	setPassword,
	onSuccess,
	isModal,
}) => {
	const [error, setError] = useState<string | undefined>();
	const api = useAdminApi();
	const navigate = useNavigate();

	const tryToLogin = () => {
		(async () => {
			const response = await api.login(email, password);

			console.log('response', response);

			if (response.kind === 'Success') {
				api.setAuth(response.value.token, response.value.admin);
				setError(undefined);
				if (!isModal) {
					console.log('navigating to /');
					navigate('/');
				}

				if (onSuccess) {
					onSuccess();
				}
			} else {
				setError(response.message);
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
				tryToLogin();
				e.preventDefault();
			}}>
				<h1>Admin login</h1>

				<RedirectMessageC ignore={error !== undefined}/>
				<MessageC message={error} type='error'/>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='email'>Email</InputLabel>
					<Input id='email' type='email' {...bind(email, setEmail)}/>
				</FormControl>

				<FormControl sx={{mb: 2, display: 'block'}}>
					<InputLabel htmlFor='password'>Password</InputLabel>
					<Input id='password' type='password' {...bind(password, setPassword)}/>
				</FormControl>

				<Button type='submit' variant='contained' sx={{mt: 2}}>
					Login
				</Button>

				{(!isModal) && <Box sx={{mt: 2}}>
					<Link to='/register'>Register instead</Link>
				</Box>}
			</form>
		</Box>
	);

	return ui;
};

export default LoginC;
