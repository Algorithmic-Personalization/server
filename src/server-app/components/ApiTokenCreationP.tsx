import React, {useEffect, useState} from 'react';
import {Box, Button, TextField, Paper, Typography} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {type SxProps} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';

import type {Token} from '../../server/models/token';
import {NotificationsC, type Message} from './shared/NotificationsC';
import CardC from './shared/CardC';

const ConfirmButtonC: React.FC<{
	action: () => void;
	label: string;
	confirm?: string;
	sx?: SxProps;
}> = ({action, label, confirm, sx}) => {
	const [clicked, setClicked] = useState(false);

	const confirmText = confirm ?? 'Are you sure?';

	if (clicked) {
		return (
			<Box
				sx={{
					...sx,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					mr: 2,
				}}
			>
				<Typography
					variant='body2'
					sx={{
						mb: 1,
					}}
				>
					{confirmText}
				</Typography>
				<Box>
					<Button
						variant='outlined'
						color='warning'
						onClick={action}
						sx={{mr: 1}}
					>
						Yes
					</Button>
					<Button
						variant='outlined'
						color='success'
						onClick={() => {
							setClicked(false);
						}}
					>
						No
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Button
			sx={sx}
			variant='outlined'
			color='primary'
			onClick={() => {
				setClicked(true);
			}}
		>
			{label}
		</Button>
	);
};

const CopyToClipboardC: React.FC<{text: string}> = ({text}) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setTimeout(() => {
				setCopied(false);
			}, 5000);
		}
	}, [copied]);

	return (
		<>
			<Button
				variant='contained'
				sx={{
					mr: 1,
				}}
				onClick={() => {
					navigator.clipboard.writeText(text).catch(console.error);
					setCopied(true);
				}}
				endIcon={<ContentCopyIcon/>}
			>
				Copy to clipboard
			</Button>
			{copied && <Typography variant='body2'>Token copied to clipboard</Typography>}
		</>
	);
};

const TokenListC: React.FC<{
	tokens?: Token[];
	deleteToken: (id: string) => () => Promise<void>;
}> = ({tokens, deleteToken}) => {
	if (!tokens) {
		return <Typography variant='body1'>Loading...</Typography>;
	}

	if (tokens.length === 0) {
		return <Typography variant='body1'>No API tokens created yet</Typography>;
	}

	return (
		<Box>
			{tokens.map(token => (
				<CardC key={token.id} sx={{mb: 2}}>
					<Typography variant='body1' sx={{mb: 1}}><strong>{token.name}</strong></Typography>
					<Typography
						variant='body2'
						sx={{
							mb: 1,
							fontSize: '12px',
							wordBreak: 'break-all',
							userSelect: 'none',
						}}
					>
						{token.token}
					</Typography>
					<Box
						sx={{
							mt: 1,
							display: 'flex',
							flexDirection: {xs: 'column', sm: 'row'},
							gap: 1,
							alignItems: {xs: 'stretch', sm: 'center'},
						}}
					>
						<ConfirmButtonC
							action={deleteToken(token.token)}
							label='Delete this token'
							confirm='Are you sure you want to delete this token?'
						/>
						<CopyToClipboardC text={token.token}/>
					</Box>
				</CardC>
			))}
		</Box>
	);
};

export const TokenC: React.FC = () => {
	const [tokens, setTokens] = useState<Token[]>();
	const [name, setName] = useState<string>('');
	const [message, setMessage] = useState<Message>();

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const tokens = await api.getApiTokens();

			if (tokens.kind === 'Success') {
				setTokens(tokens.value);
			} else {
				setMessage({
					text: tokens.message,
					severity: 'error',
				});
			}
		})();
	}, []);

	const createToken = async () => {
		try {
			const token = await api.createApiToken(name);

			if (token.kind === 'Success') {
				setTokens([...(tokens ?? []), token.value]);
				setMessage({
					text: 'API token created',
					severity: 'success',
				});
			} else {
				setMessage({
					text: token.message,
					severity: 'error',
				});
			}
		} catch (error) {
			console.error(error);
			setMessage({
				text: 'Failed to create API token, unexpected error',
				severity: 'error',
			});
		}
	};

	const deleteToken = (token: string) => async () => {
		try {
			const res = await api.deleteApiToken(token);
			if (res.kind === 'Success') {
				setTokens((tokens ?? []).filter(t => t.token !== token));
				setMessage({
					text: 'API token deleted',
					severity: 'warning',
				});
			} else {
				setMessage({
					text: res.message,
					severity: 'error',
				});
			}
		} catch (error) {
			setMessage({
				text: 'Failed to delete API token, unexpected error',
				severity: 'error',
			});
		}
	};

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>API Tokens</Typography>

			<NotificationsC message={message}/>

			<Paper sx={{p: 2}}>
				<TokenListC tokens={tokens} deleteToken={deleteToken}/>
			</Paper>

			<Box
				sx={{
					mt: 2,
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<TextField
					label='Token name'
					value={name}
					onChange={event => {
						setName(event.target.value);
					}}
				/>
				<Button
					variant='contained'
					color='primary'
					onClick={createToken}
					sx={{mx: 2}}
				>
					Create new API token
				</Button>
			</Box>
		</Box>
	);

	return ui;
};

export default TokenC;
