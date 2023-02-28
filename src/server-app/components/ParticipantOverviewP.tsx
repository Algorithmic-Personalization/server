import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';

import type ParticipantOverview from '../../server/projections/ParticipantOverview';
import type EventOverview from '../../server/projections/EventOverview';

import {
	Box,
	Button,
	Grid,
	Paper,
	Typography,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';
import type SessionOverview from '../../server/projections/SessionOverview';
import type RecommendationsList from '../../server/projections/RecommendationsList';
import type {VideoItem} from '../../server/projections/RecommendationsList';
import {VideoType} from '../../server/models/videoListItem';
import {EventType} from '../../common/models/event';

import {showDate, UrlC} from './shared/util';

const showWatchtimeOrContextUrl = (e: EventOverview): string => {
	if (e.data?.kind === 'watchtime') {
		return `${e.data.watchtime} seconds`;
	}

	return e.context ?? '';
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
		<ul style={{listStyle: 'none'}}>
			{data.map(item => (
				<li key={item.id}>
					<UrlC url={item.url} prefix={getDetails(item)} />
				</li>
			))}
		</ul>
	);
};

const RecommendationsC: React.FC<{data: RecommendationsList}> = ({data}) => (
	<Grid container sx={{pl: 8, mb: 2}}>
		<Grid item xs={12} sm={4} lg={3}>
			<Typography variant='body1' color='grey'>
				Non-Personalized ({data.nonPersonalized.length})
			</Typography>
			<RecommendationsListC data={data.nonPersonalized}/>
		</Grid>
		<Grid item xs={12} sm={4} lg={3}>
			<Typography variant='body1' color='grey'>
				Personalized ({data.personalized.length})
			</Typography>
			<RecommendationsListC data={data.personalized}/>
		</Grid>
		<Grid item xs={12} sm={4} lg={3}>
			<Typography variant='body1' color='grey' sx={{position: {md: 'relative'}}}>
				Shown ({data.shown.length})
				<small style={{position: 'absolute', left: 0, top: '1.2rem'}}>
					p: personalized, np: non personalized, m: mixed
				</small>
			</Typography>
			<RecommendationsListC data={data.shown} details={true}/>
		</Grid>
	</Grid>
);

const LegendC: React.FC<{label: string}> = ({label}) => {
	if (!label) {
		return null;
	}

	return (
		<Typography variant='body1' sx={{
			display: 'block',
			fontSize: '0.8rem',
			color: 'grey',
		}}><strong>{label}</strong></Typography>
	);
};

const EventC: React.FC<{data: EventOverview; position: number}> = ({data: overview, position}) => {
	const contextLegend = () => {
		if (overview.type === EventType.WATCH_TIME) {
			return 'watchtime';
		}

		if (overview.type === EventType.PAGE_VIEW || overview.type === EventType.RECOMMENDATIONS_SHOWN) {
			return 'previous page';
		}

		return 'context';
	};

	return (<>
		<Grid container sx={{pl: 4}}>
			<Grid item xs={12} md={2}>
				<Typography variant='body1' sx={{mb: 2}}><strong>{position}</strong>&#41; {showDate(overview.createdAt)}</Typography>
			</Grid>
			<Grid item xs={12} md={3}>
				<LegendC label='event type'/>
				<Typography variant='body1' sx={{mb: 2}}>{overview.type}</Typography>
			</Grid>
			<Grid item xs={12} md={2}>
				<LegendC label={contextLegend()}/>
				<Typography variant='body1' sx={{mb: 2}}>
					<UrlC url={showWatchtimeOrContextUrl(overview)}/>
				</Typography>
			</Grid>
			<Grid item xs={12} md={2}>
				<LegendC label='url'/>
				<Typography variant='body1' sx={{mb: 2}}><UrlC url={overview.url}/></Typography>
			</Grid>
			<Grid item xs={12} md={3}>
				<LegendC label='extension version'/>
				<Typography variant='body1' sx={{mb: 2}}>{overview.extensionVersion}</Typography>
			</Grid>
		</Grid>
		<Box sx={{display: 'flex', alignItems: 'center'}}>
			{overview?.data?.kind === 'recommendations' && <RecommendationsC data={overview.data.recommendations} />}
		</Box>
	</>);
};

const EventsListC: React.FC<{count: number; sessionUuid: string}> = ({count, sessionUuid}) => {
	const api = useAdminApi();
	const [events, setEvents] = useState<EventOverview[]>([]);
	const [folded, setFolded] = useState(true);

	useEffect(() => {
		if (folded) {
			return;
		}

		api.getEventOverviews(sessionUuid).then(
			data => {
				if (data.kind === 'Success') {
					setEvents(data.value);
				}
			},
		).catch(console.error);
	}, [sessionUuid, folded]);

	if (count === 0) {
		return <Typography variant='body1'>No events</Typography>;
	}

	if (folded) {
		return (
			<Button
				variant='outlined'
				color='primary'
				sx={{
					m: 1,
				}}
				onClick={() => {
					setFolded(false);
				}}
			>
				Unfold {count} events
			</Button>
		);
	}

	if (events.length === 0) {
		return <Typography variant='body1'>Loading events...</Typography>;
	}

	return (
		<Box>
			<Typography variant='body1' sx={{mb: 2, fontWeight: 'bold'}}>Events (latest first)</Typography>
			{events.map((event, index) => <EventC key={event.id} data={event} position={events.length - index} />)}
			<Button
				variant='outlined'
				color='primary'
				sx={{
					m: 1,
				}}
				onClick={() => {
					setFolded(true);
				}}
			>
				Fold back {count} events
			</Button>
		</Box>
	);
};

const SessionC: React.FC<{data: SessionOverview}> = ({data}) => (
	<Paper component='section' sx={{mb: 4, ml: 2, p: 2}}>
		<Typography variant='h4' sx={{mb: 2}}>Session #{data.id}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Session UUID: {data.uuid}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Started on: {showDate(data.startedAt)}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Ended on: {showDate(data.endedAt)}</Typography>
		<EventsListC count={data.eventCount} sessionUuid={data.uuid} />
	</Paper>
);

const OverviewC: React.FC<{data: ParticipantOverview}> = ({data}) => (
	<>
		<Paper component='section' sx={{mb: 4, p: 2}}>
			<Typography variant='h3' sx={{mb: 2}}>Basic info</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Email:</strong> {data.email}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Code:</strong> {data.code}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Added on:</strong> {showDate(data.createdAt)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Last seen:</strong> {showDate(data.latestSessionDate)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>First seen:</strong> {showDate(data.firstSessionDate)}</Typography>
			<Typography variant='body1' sx={{mb: 2}}><strong>Number of sessions:</strong> {data.sessionCount}</Typography>
		</Paper>
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h3' sx={{mb: 2}}>Sessions (most recent first)</Typography>
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
