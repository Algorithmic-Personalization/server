import React from 'react';

import {Box, Typography, type SxProps, type Theme} from '@mui/material';

export const MessageC: React.FC<{
	message?: string;
	type: 'error' | 'success' | 'info';
	sx?: SxProps<Theme>;
}> = ({message, type, sx}) => {
	if (!message) {
		return null;
	}

	const color = type === 'error' ? 'error.main' : type === 'success' ? 'success.main' : 'primary.main';

	return (
		<Box>
			<Box sx={{
				mt: 2,
				mb: 2,
				p: 2,
				borderColor: color,
				display: 'inline-block',
				borderRadius: 4,
				...sx,
			}} border={1}>
				<Typography color={color}>{message}</Typography>
			</Box>
		</Box>
	);
};

export const StatusMessageC: React.FC<{
	info?: string;
	success?: string;
	error?: string;
	sx?: SxProps<Theme>;
}> = ({info, success, error, sx}) => {
	if (error) {
		return <MessageC message={error} type='error' sx={sx}/>;
	}

	if (success) {
		return <MessageC message={success} type='success' sx={sx}/>;
	}

	if (info) {
		return <MessageC message={info} type='info' sx={sx}/>;
	}

	return null;
};

export default MessageC;
