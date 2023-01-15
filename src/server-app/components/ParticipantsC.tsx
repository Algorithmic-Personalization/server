import React, {useEffect, useState, useRef} from 'react';

import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	Grid,
	Typography,
} from '@mui/material';

import FileIcon from '@mui/icons-material/FileUpload';

import DLinkC from './DownloadLinkC';
import MessageC, {StatusMessageC} from './MessageC';

import {useAdminApi} from '../adminApiProvider';

// @ts-expect-error this is a text file, not a module
import csvSample from '../../../public/participants.sample.csv';

import type Participant from '../../common/models/participant';
import type {Page} from '../../server/lib/pagination';

const UploadFormC: React.FC = () => {
	const exampleString = csvSample as string;

	const [info, setInfo] = useState<string | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);
	const form = useRef<HTMLFormElement>(null);

	const api = useAdminApi();

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target?.files?.[0];

		if (!file) {
			return;
		}

		(async () => {
			setInfo('Uploading...');
			setError(undefined);
			setSuccess(undefined);

			const res = await api.uploadParticipants(file);

			if (res.kind === 'Success') {
				setSuccess(res.value);
			} else {
				setError(res.message);
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
				<StatusMessageC {...{info, error, success}}/>
			</form>
		</Box>
	);

	return ui;
};

const ParticipantRowC: React.FC<{participant: Participant}> = ({
	participant,
}) => {
	const ui = (
		<Grid container item xs={12}>
			<Grid item sm={4} xs={12}>
				<Typography>{participant.email}</Typography>
			</Grid>
			<Grid item sm={4} xs={12}>
				<Typography sx={{wordBreak: 'break-word'}}>{participant.code}</Typography>
			</Grid>
			<Grid item sm={4} xs={12}>
				<Typography>{participant.arm}</Typography>
			</Grid>
		</Grid>
	);

	return ui;
};

const ListC: React.FC = () => {
	const [participants, setParticipants] = useState<Page<Participant> | undefined>();
	const [pageInput, setPageInput] = useState('1');
	const pTmp = Math.min(Math.max(parseInt(pageInput, 10), 0), participants?.pageCount ?? 1);
	const pageInputOk = Number.isInteger(pTmp);
	const page = pageInputOk ? pTmp : 1;
	const [error, setError] = useState<string | undefined>();

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const res = await api.getParticipants(page - 1);

			if (res.kind === 'Success') {
				setError(undefined);
				setParticipants(res.value);
			} else {
				setError(res.message);
			}
		})();
	}, [page]);

	const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPageInput(e.target.value);
	};

	const list = participants === undefined ? <Typography>Loading...</Typography>
		: participants.results.length === 0 ? (
			<Typography>No participants yet.</Typography>
		) : (
			<Grid container spacing={2}>
				<Grid container item xs={12}>
					<Grid item sm={4} xs={12}>
						<Typography><strong>Email</strong></Typography>
					</Grid>
					<Grid item sm={4} xs={12}>
						<Typography><strong>Code</strong></Typography>
					</Grid>
					<Grid item sm={4} xs={12}>
						<Typography><strong>Experiment arm</strong></Typography>
					</Grid>
				</Grid>
				<Grid container item xs={12}>
					<Typography sx={{display: 'flex', alignItems: 'center'}}>
						<span>Page&nbsp;</span>
						<input
							type='number'
							value={pageInputOk ? page : pageInput}
							min={1}
							max={participants.pageCount}
							step={1}
							onChange={handlePageChange}
						/>
						<span>&nbsp;/&nbsp;</span>
						<span>{participants.pageCount}</span>
					</Typography>
				</Grid>
				{participants.results.map(participant => (
					<ParticipantRowC key={participant.id} participant={participant}/>
				))}
			</Grid>
		);

	return (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Participants list</Typography>
			<MessageC message={error} type='error'/>

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
