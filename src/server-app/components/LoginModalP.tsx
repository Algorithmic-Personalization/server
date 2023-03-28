import React, {useState} from 'react';
import {type To, useLocation, useNavigate} from 'react-router-dom';
import {Box, Modal, Typography} from '@mui/material';

import LoginC from './LoginP';

export const LoginModalC: React.FC<{
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess?: () => void;
}> = ({open, setOpen, onSuccess}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const location = useLocation();
	const navigate = useNavigate();
	console.log('modal says: location', location);

	return (
		<Modal open={open}>
			<Box sx={{bgcolor: 'background.paper', padding: 4}}>
				<Typography sx={{textAlign: 'center'}}>
					It seems your session has expired, please log back in.
				</Typography>
				<LoginC
					{...{email, setEmail, password, setPassword}}
					onSuccess={() => {
						setOpen(false);

						if (onSuccess) {
							onSuccess();
						}

						if (location.state.from) {
							console.log('redirecting to', location.state.from);
							navigate(location.state.from as To);
						} else {
							console.log('redirecting to /');
							navigate('/');
						}
					}}
					isModal={true}
				/>
			</Box>
		</Modal>
	);
};

export default LoginModalC;
