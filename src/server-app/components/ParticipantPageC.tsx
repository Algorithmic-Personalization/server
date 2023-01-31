import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';

import type ParticipantOverview from '../../server/projections/ParticipantOverview';

import {
	Box,
	Typography,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';

const OverviewC: React.FC<{data: ParticipantOverview}> = ({data}) => {
	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Basic info</Typography>
			<Typography variant='body1' sx={{mb: 2}}>Email: {data.email}</Typography>
		</Box>
	);

	return ui;
};

export const ParticipantPageC: React.FC = () => {
	const {email} = useParams();
	const api = useAdminApi();

	const [overview, setOverview] = useState<ParticipantOverview | undefined>(undefined);

	useEffect(() => {
		if (!email) {
			console.error('No email provided');
			return;
		}

		api.getParticipantOverview(email).then(res => {
			if (res.kind === 'Success') {
				setOverview(res.value);
			}
		}).catch(err => {
			console.error(err);
		});
	}, [email]);

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Participant: {email}</Typography>
			{overview === undefined ? 'Loading...' : <OverviewC data={overview} />}
		</Box>
	);

	return ui;
};

export default ParticipantPageC;
