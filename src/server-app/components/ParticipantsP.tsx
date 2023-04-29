import React, {useEffect, useState, useRef} from 'react';

import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';

import FileIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';

import {Link} from 'react-router-dom';

import DLinkC from './shared/DownloadLinkC';
import NotificationsC, {type Message} from './shared/NotificationsC';

import createTableComponent, {type TableDescriptor} from './shared/TableC';

import {useAdminApi} from '../adminApiProvider';

// @ts-expect-error this is a text file, not a module
import csvSample from '../../../public/participants.sample.csv';

import type Participant from '../../server/models/participant';
import {Phase} from '../../server/models/transitionSetting';
import type {Page} from '../../server/lib/pagination';

const translatePhase = (p: Phase): string => {
	if (p === Phase.PRE_EXPERIMENT) {
		return 'Pre-Experiment';
	}

	if (p === Phase.EXPERIMENT) {
		return 'Experiment';
	}

	if (p === Phase.POST_EXPERIMENT) {
		return 'Post-Experiment';
	}

	return 'Unknown';
};

const tableDescriptor: TableDescriptor<Participant> = {
	headers: [
		{
			key: 'code',
			element: 'Participant Code',
		},
		{
			key: 'experiment-arm',
			element: 'Experiment arm',
		},
		{
			key: 'extension-installed',
			element: 'Extension installed',
		},
		{
			key: 'phase',
			element: 'Experiment Phase',
		},
	],
	rows: p => ({
		key: p.code,
		elements: [
			// eslint-disable-next-line react/jsx-key
			<Link to={`/participants/${p.code}`}>{p.code}</Link>,
			p.arm,
			p.extensionInstalled ? 'yes' : 'no',
			translatePhase(p.phase),
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
				it should have at least the following 2 columns:
				<ul>
					<li>code</li>
					<li>arm</li>
				</ul>
				where &quot;arm&quot; is either
				&quot;control&quot; or &quot;treatment&quot;.
				<br/>
				<strong>Note:</strong> The &quot;code&quot; column should contain
				large random values so that participant codes cannot be guessed.
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
	const [codeLike, setCodeLike] = useState('');
	const [phase, setPhase] = useState<Phase | number>(-1);
	const [extensionInstalled, setExtensionInstalled] = useState<'yes' | 'no' | 'any'>('any');

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const res = await api.getParticipants(
				{
					codeLike,
					phase,
					extensionInstalled,
				},
				page - 1,
			);

			if (res.kind === 'Success') {
				setParticipants(res.value);
			} else {
				setMessage({
					text: res.message,
					severity: 'error',
				});
			}
		})();
	}, [page, codeLike, phase, extensionInstalled]);

	if (participants === undefined) {
		return <Typography>Loading...</Typography>;
	}

	const list = (
		<Box>
			<Box sx={{display: {xl: 'flex'}, gap: 2, alignItems: 'top'}}>
				<Box sx={{
					mb: 2,
					display: 'flex',
					alignItems: 'stretch',
					flexDirection: 'column',
					width: 'max-content',
					gap: 1,
				}}>
					<TextField
						value={codeLike}
						onChange={e => {
							setCodeLike(e.target.value);
							setPageInput('1');
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
					<FormControl>
						<InputLabel id='participant-phase-search'>Filter by phase</InputLabel>
						<Select
							labelId='participant-phase-search'
							label='Filter by phase'
							onChange={e => {
								setPhase(e.target.value as Phase);
								setPageInput('1');
							}}
							value={phase}
						>
							<MenuItem value={-1}>Any</MenuItem>
							<MenuItem value={Phase.PRE_EXPERIMENT}>Pre-Experiment</MenuItem>
							<MenuItem value={Phase.EXPERIMENT}>Experiment</MenuItem>
							<MenuItem value={Phase.POST_EXPERIMENT}>Post-Experiment</MenuItem>
						</Select>
					</FormControl>
					<FormControl>
						<InputLabel id='participant-extension-installed-search'>Extension installed</InputLabel>
						<Select
							labelId='participant-extension-installed-search'
							label='Extension installed'
							onChange={e => {
								setExtensionInstalled(e.target.value as 'yes' | 'no' | 'any');
								setPageInput('1');
							}}
							value={extensionInstalled}
						>
							<MenuItem value='any'>Any</MenuItem>
							<MenuItem value='yes'>Yes</MenuItem>
							<MenuItem value='no'>No</MenuItem>
						</Select>
					</FormControl>
					<Box sx={{display: 'flex', alignItems: 'center'}}>
						<Typography variant='body2'>Page&nbsp;</Typography>
						<input
							type='number'
							value={pageInputOk ? page : pageInput}
							min={1}
							max={participants.pageCount}
							step={1}
							onChange={e => {
								setPageInput(e.target.value);
							}}
						/>
						<Typography variant='body2'>&nbsp;/&nbsp;</Typography>
						<Typography variant='body2'>{participants.pageCount}&nbsp;({participants.count} total)</Typography>
					</Box>
				</Box>
				<Box sx={{flexGrow: 1}}>
					<TableC items={participants.results}/>
				</Box>
			</Box>
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
