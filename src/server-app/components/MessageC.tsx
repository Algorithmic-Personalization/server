import React, {useEffect, useState} from 'react';

import {Box, Typography, type SxProps, type Theme} from '@mui/material';

export const MessageC: React.FC<{
	message?: string;
	type: 'error' | 'success' | 'info';
	disappearMs?: number;
	sx?: SxProps<Theme>;
}> = ({message, type, disappearMs, sx}) => {
	const [text, setText] = useState<string>();
	const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout>();

	const disappear = disappearMs ?? 5000;

	console.log('message: ', message, 'text: ', text);

	useEffect(() => {
		setText(message);
	}, [message]);

	useEffect(() => {
		if (disappear > 0) {
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
			}

			const h = setTimeout(() => {
				console.log('timeout');
				setText(undefined);
			}, disappear);
			setTimeoutHandle(h);
		}
	}, [text, disappear]);

	if (!text) {
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
				<Typography color={color}>{text}</Typography>
			</Box>
		</Box>
	);
};

export const StatusMessageC: React.FC<{
	info?: string;
	success?: string;
	error?: string;
	sx?: SxProps<Theme>;
}> = ({info, success, error, sx}) => (
	<Box
		sx={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch',
		}}
	>
		<MessageC message={error} type='error' sx={sx}/>
		<MessageC message={success} type='success' sx={sx}/>
		<MessageC message={info} type='info' sx={sx}/>
	</Box>
);

export default MessageC;
