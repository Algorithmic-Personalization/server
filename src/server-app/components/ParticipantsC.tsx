import React, {useEffect, useState, useRef} from 'react';

import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	InputAdornment,
	TextField,
	Typography,
} from '@mui/material';

import FileIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';

import {Link} from 'react-router-dom';

import DLinkC from './DownloadLinkC';
import NotificationsC, {type Message} from './NotificationsC';

import createTableComponent, {type TableDescriptor} from './shared/TableC';

import {useAdminApi} from '../adminApiProvider';

// @ts-expect-error this is a text file, not a module
import csvSample from '../../../public/participants.sample.csv';

import type Participant from '../../server/models/participant';
import type {Page} from '../../server/lib/pagination';

const tableDescriptor: TableDescriptor<Participant> = {
	headers: [
		{
			key: 'email',
			element: 'Email',
		},
		{
			key: 'code',
			element: 'Participant Code',
		},
		{
			key: 'experiment-arm',
			element: 'Experiment arm',
		},
	],
	rows: p => ({
		key: p.email,
		elements: [
			// eslint-disable-next-line react/jsx-key
			<Link to={`/participants/${p.email}`}>{p.email}</Link>,
			p.code,
			p.arm,
		],
	}),
};

const TableC = createTableComponent(tableDescriptor);

const UploadFormC: React.FC = () => {
	const exampleString = csvSample as string;

	const [message, setMessage] = useState<Message>();
	const form = useRef<HTMLFormElement>(null);

	const api = useAdminApi();

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target?.files?.[0];

		if (!file) {
			return;
		}

		(async () => {
			setMessage({
				text: 'Uploading participants file...',
			});

			const res = await api.uploadParticipants(file);

			if (res.kind === 'Success') {
				setMessage({
					text: res.value,
					severity: 'success',
				});
			} else {
				setMessage({
					text: res.message,
					severity: 'error',
				});
			}

			if (form.current) {
				form.current.reset();
			}
		})();
	};

	const example = (
		<Box sx={{mb: 4}}>
			<Typography>
				<strong>Example file:</strong>
				&nbsp;<DLinkC href='/participants.sample.csv'>(download)</DLinkC>
			</Typography>
			<pre style={{marginTop: 0, maxWidth: '100%', overflow: 'auto'}}>
				{exampleString}
			</pre>
		</Box>
	);

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Add Participants</Typography>
			<Typography variant='body1' component='div' sx={{mb: 2}}>
				You can add participants to the experiment by uploading a CSV file,
				it should have at least the following 3 columns:
				<ul>
					<li>email</li>
					<li>code</li>
					<li>arm</li>
				</ul>
				where &quot;arm&quot; is either
				&quot;control&quot; or &quot;treatment&quot;.
				<p>
					<strong>Note:</strong> The &quot;code&quot; column should contain
					large random values so that participant codes cannot be guessed.
				</p>
			</Typography>
			{example}
			<form ref={form}>
				<FormControl sx={{mb: 2}}>
					<Button
						component='label'
						variant='outlined'
						htmlFor='list'
						endIcon={<FileIcon/>}
					>
						Upload CSV
						<input
							hidden
							type='file'
							id='list'
							name='list'
							accept='.csv'
							onChange={onFileChange}
						/>
					</Button>
					<FormHelperText>
						The separator must be a comma.
					</FormHelperText>
				</FormControl>
				<NotificationsC message={message}/>
			</form>
		</Box>
	);

	return ui;
};

const ListC: React.FC = () => {
	const [participants, setParticipants] = useState<Page<Participant> | undefined>();
	const [pageInput, setPageInput] = useState('1');
	const pTmp = Math.min(Math.max(parseInt(pageInput, 10), 0), participants?.pageCount ?? 1);
	const pageInputOk = Number.isInteger(pTmp);
	const page = pageInputOk ? pTmp : 1;
	const [message, setMessage] = useState<Message>();
	const [emailLike, setEmailLike] = useState('');

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const res = await api.getParticipants(page - 1, emailLike);

			if (res.kind === 'Success') {
				setParticipants(res.value);
			} else {
				setMessage({
					text: res.message,
					severity: 'error',
				});
			}
		})();
	}, [page, emailLike]);

	const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPageInput(e.target.value);
	};

	if (participants === undefined) {
		return <Typography>Loading...</Typography>;
	}

	if (emailLike === '' && participants.results.length === 0) {
		return <Typography>No participants yet.</Typography>;
	}

	const list = (
		<Box>
			<Box sx={{mb: 1}}>
				<TextField
					value={emailLike}
					onChange={e => {
						setEmailLike(e.target.value);
					}}
					sx={{display: 'block'}}
					label='Search participant by email'
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<SearchIcon/>
							</InputAdornment>
						),
					}}
				/>
			</Box>
			<Box sx={{my: 2}}>
				<Typography sx={{display: 'flex', alignItems: 'center'}}>
					<Typography variant='body2'>Page&nbsp;</Typography>
					<input
						type='number'
						value={pageInputOk ? page : pageInput}
						min={1}
						max={participants.pageCount}
						step={1}
						onChange={handlePageChange}
					/>
					<Typography variant='body2'>&nbsp;/&nbsp;</Typography>
					<Typography variant='body2'>{participants.pageCount}</Typography>
				</Typography>
			</Box>
			<TableC items={participants.results}/>
		</Box>
	);

	return (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Participants list</Typography>
			<NotificationsC message={message}/>
			{list}
		</Box>
	);
};

export const ParticipantsC: React.FC = () => (
	<div>
		<Typography variant='h1' sx={{mb: 4}}>Participants</Typography>
		<ListC />
		<UploadFormC />
	</div>
);

export default ParticipantsC;
