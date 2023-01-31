import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';

import type ParticipantOverview from '../../server/projections/ParticipantOverview';
import type EventOverview from '../../server/projections/EventOverview';
import {EventType} from '../../common/models/event';

import {
	Box,
	Grid,
	Typography,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';
import type SessionOverview from '../../server/projections/SessionOverview';

const showDate = (d: Date | string): string => {
	const date = new Date(d);
	return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const showWatchtimeOrContextUrl = (e: EventOverview): string => {
	if (e.data?.kind === 'watchtime') {
		return `${e.data.watchtime} seconds`;
	}

	return e.context ?? '';
};

const UrlC: React.FC<{url: string}> = ({url}) => {
	const link = url.startsWith('/') ? `https://youtube.com${url}` : url;

	try {
		const u = new URL(link);

		if (u.pathname === '/results') {
			return <a style={{textDecoration: 'none'}} href={url} target='_blank' rel='noreferrer'>
				search: {u.searchParams.get('search_query')}
			</a>;
		}

		if (u.pathname === '/watch') {
			return <a style={{textDecoration: 'none'}} href={url} target='_blank' rel='noreferrer'>
				video: {u.searchParams.get('v')}
			</a>;
		}

		return <a style={{textDecoration: 'none'}} href={url} target='_blank' rel='noreferrer'>
			{u.pathname} {u.search}
		</a>;
	} catch (e) {
		return <>{url}</>;
	}
};

const EventC: React.FC<{data: EventOverview}> = ({data}) => {
	if (data.type === EventType.RECOMMENDATIONS_SHOWN) {
		return (<Typography variant='body1' sx={{mb: 4}}>Recommendations shown NIY</Typography>);
	}

	return (
		<Grid container sx={{pl: 4}}>
			<Grid item xs={3}>
				<Typography variant='body1' sx={{mb: 2}}>{showDate(data.createdAt)}</Typography>
			</Grid>
			<Grid item xs={2}>
				<Typography variant='body1' sx={{mb: 2}}>{data.type}</Typography>
			</Grid>
			<Grid item xs={4}>
				<Typography variant='body1' sx={{mb: 2}}><UrlC url={showWatchtimeOrContextUrl(data)}/></Typography>
			</Grid>
			<Grid item xs={3}>
				<Typography variant='body1' sx={{mb: 2}}><UrlC url={data.url}/></Typography>
			</Grid>
		</Grid>
	);
};

const SessionC: React.FC<{data: SessionOverview}> = ({data}) => (
	<Box component='section' sx={{mb: 4, pl: 2}}>
		<Typography variant='h4' sx={{mb: 2}}>Session #{data.id}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Started on: {showDate(data.startedAt)}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Ended on: {showDate(data.endedAt)}</Typography>
		{data.events.length === 0 ? 'No events' : (
			<>
				<Typography variant='h4' component='h5' sx={{mb: 1}}>Events (chronological order):</Typography>
				{data.events.map(e => <EventC key={e.id} data={e} />)}
			</>
		)}
	</Box>
);

const OverviewC: React.FC<{data: ParticipantOverview}> = ({data}) => (
	<>
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h3' sx={{mb: 2}}>Basic info</Typography>
			<Typography variant='body1' sx={{mb: 2}}>Email: {data.email}</Typography>
			<Typography variant='body1' sx={{mb: 2}}>Code: {data.code}</Typography>
			<Typography variant='body1' sx={{mb: 2}}>Added on: {showDate(data.createdAt)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}>Last seen: {showDate(data.latestSessionDate)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}>First seen: {showDate(data.firstSessionDate)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}>Number of sessions: {data.sessionCount}</Typography>
		</Box>
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h3' sx={{mb: 2}}>Sessions</Typography>
			{data.sessions.length === 0 ? 'No sessions' : data.sessions.map(
				session => <SessionC key={session.id} data={session} />,
			)}
		</Box>
	</>
);

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
