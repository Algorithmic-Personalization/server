import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';

import type ParticipantOverview from '../../server/projections/ParticipantOverview';
import type EventOverview from '../../server/projections/EventOverview';

import {
	Box,
	Grid,
	Typography,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';
import type SessionOverview from '../../server/projections/SessionOverview';
import type RecommendationsList from '../../server/projections/RecommendationsList';
import type {VideoItem} from '../../server/projections/RecommendationsList';
import {VideoType} from '../../server/models/videoListItem';

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

const RecommendationsListC: React.FC<{data: VideoItem[]; details?: boolean}> = ({data, details}) => {
	const getDetails = (item: VideoItem) => {
		if (!details) {
			return '';
		}

		if (item.source === VideoType.NON_PERSONALIZED) {
			return 'np: ';
		}

		if (item.source === VideoType.PERSONALIZED) {
			return 'p: ';
		}

		return 'm: ';
	};

	return (
		<ul>
			{data.map(item => (
				<li key={item.id}>
					{getDetails(item)}<UrlC url={item.url} />
				</li>
			))}
		</ul>
	);
};

const RecommendationsC: React.FC<{data: RecommendationsList}> = ({data}) => (
	<Grid container sx={{pl: 8, mb: 2}}>
		<Grid item xs={3}>
			Non-Personalized
			<RecommendationsListC data={data.nonPersonalized}/>
		</Grid>
		<Grid item xs={3}>
			Personalized
			<RecommendationsListC data={data.personalized}/>
		</Grid>
		<Grid item xs={3}>
			Shown
			<RecommendationsListC data={data.shown} details={true}/>
		</Grid>
	</Grid>
);

const EventC: React.FC<{data: EventOverview; position: number}> = ({data: overview, position}) => (
	<>
		<Grid container sx={{pl: 4}}>
			<Grid item xs={2}>
				<Typography variant='body1' sx={{mb: 2}}><strong>{position}</strong>&#41; {showDate(overview.createdAt)}</Typography>
			</Grid>
			<Grid item xs={3}>
				<Typography variant='body1' sx={{mb: 2}}>{overview.type}</Typography>
			</Grid>
			<Grid item xs={4}>
				<Typography variant='body1' sx={{mb: 2}}><UrlC url={showWatchtimeOrContextUrl(overview)}/></Typography>
			</Grid>
			<Grid item xs={3}>
				<Typography variant='body1' sx={{mb: 2}}><UrlC url={overview.url}/></Typography>
			</Grid>
		</Grid>
		{overview?.data?.kind === 'recommendations' && <RecommendationsC data={overview.data.recommendations} />}
	</>
);

const SessionC: React.FC<{data: SessionOverview}> = ({data}) => (
	<Box component='section' sx={{mb: 4, pl: 2}}>
		<Typography variant='h4' sx={{mb: 2}}>Session #{data.id}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Started on: {showDate(data.startedAt)}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Ended on: {showDate(data.endedAt)}</Typography>
		{data.events.length === 0 ? 'No events' : (
			<>
				<Typography variant='h4' component='h5' sx={{mb: 1}}>Events (chronological order):</Typography>
				{data.events.map((e, p) => <EventC key={e.id} data={e} position={p + 1}/>)}
			</>
		)}
	</Box>
);

const OverviewC: React.FC<{data: ParticipantOverview}> = ({data}) => (
	<>
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h3' sx={{mb: 2}}>Basic info</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Email:</strong> {data.email}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Code:</strong> {data.code}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Added on:</strong> {showDate(data.createdAt)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Last seen:</strong> {showDate(data.latestSessionDate)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>First seen:</strong> {showDate(data.firstSessionDate)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Number of sessions:</strong> {data.sessionCount}</Typography>
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
