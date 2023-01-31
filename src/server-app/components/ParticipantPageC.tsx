import React from 'react';
import {useParams} from 'react-router';

import {
	Box,
	Typography,
} from '@mui/material';

export const ParticipantPageC: React.FC = () => {
	const {email} = useParams();

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Participant: {email}</Typography>
		</Box>
	);

	return ui;
};

export default ParticipantPageC;
