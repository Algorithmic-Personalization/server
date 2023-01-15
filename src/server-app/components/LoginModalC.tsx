import React, {useState} from 'react';
import {Box, Modal, Typography} from '@mui/material';

import LoginC from './LoginC';

export const LoginModalC: React.FC<{
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess?: () => void;
}> = ({open, setOpen, onSuccess}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

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
					}}
					isModal={true}
				/>
			</Box>
		</Modal>
	);
};

export default LoginModalC;
