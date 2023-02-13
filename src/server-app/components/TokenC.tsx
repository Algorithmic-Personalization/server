import React, {useEffect, useState} from 'react';
import {Box, Button, TextField, Paper, Typography} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';

import type {Token} from '../../server/models/token';
import {StatusMessageC} from '../../common/components/MessageC';
import CardC from './CardC';

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
					<Typography variant='body2' sx={{mb: 1, fontSize: '12px', wordBreak: 'break-all'}}>{token.token}</Typography>
					<Button
						sx={{mt: 1}}
						variant='outlined'
						color='primary'
						onClick={deleteToken(token.token)}
					>
						Delete this token
					</Button>
				</CardC>
			))}
		</Box>
	);
};

export const TokenC: React.FC = () => {
	const [tokens, setTokens] = useState<Token[]>();
	const [error, setError] = useState<string>();
	const [success, setSuccess] = useState<string>();
	const [name, setName] = useState<string>('');

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const tokens = await api.getApiTokens();

			if (tokens.kind === 'Success') {
				setTokens(tokens.value);
			} else {
				setError(tokens.message);
			}
		})();
	}, []);

	const createToken = async () => {
		try {
			const token = await api.createApiToken(name);

			if (token.kind === 'Success') {
				setTokens([...(tokens ?? []), token.value]);
				setSuccess('API token created');
				setError(undefined);
			} else {
				setError(token.message);
			}
		} catch (error) {
			console.error(error);
			setError('Failed to create API token, unexpected error');
		}
	};

	const deleteToken = (token: string) => async () => {
		try {
			const res = await api.deleteApiToken(token);
			if (res.kind === 'Success') {
				setTokens((tokens ?? []).filter(t => t.token !== token));
				setError(undefined);
				setSuccess('API token deleted');
			} else {
				setError(res.message);
			}
		} catch (error) {
			console.error(error);
			setError('Failed to delete API token, unexpected error');
		}
	};

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>API Tokens</Typography>

			<StatusMessageC error={error} success={success}/>

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
