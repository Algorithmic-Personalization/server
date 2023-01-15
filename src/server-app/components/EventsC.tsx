import React, {useState, useEffect} from 'react';

import {
	Box,
	Grid,
	Typography,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';
import type Event from '../../server/models/event';

import CardC from './CardC';

const EventC: React.FC<{event: Event}> = ({event}) => (
	<Grid container item xs={12} sm={6} md={3}>
		<CardC>
			<strong>Event #{event.id}: {event.type}</strong>
			<dl>
				<dt><Typography>Timestamp</Typography></dt>
				<dd><Typography>{new Date(event.createdAt).toISOString()}</Typography></dd>
				<dt><Typography>Session</Typography></dt>
				<dd><Typography>{event.sessionUuid}</Typography></dd>
				<dt><Typography>URL</Typography></dt>
				<dd><Typography>{event.url}</Typography></dd>
			</dl>
		</CardC>
	</Grid>
);

export const EventsC: React.FC = () => {
	const [pageNumberControl, setPageNumberControl] = useState('1');
	const [pageNumber, setPageNumber] = useState(1);
	const [pageCount, setPageCount] = useState(0);
	const [events, setEvents] = useState<Event[]>([]);

	const api = useAdminApi();

	const handlePageNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPageNumberControl(e.target.value);

		const n = parseInt(e.target.value, 10);
		if (Number.isInteger(n) && n > 0) {
			setPageNumber(n);
		}
	};

	useEffect(() => {
		(async () => {
			const res = await api.getEvents(pageNumber - 1);

			if (res.kind === 'Success') {
				setPageCount(res.value.pageCount);
				setEvents(res.value.results);
			}
		})();
	}, [pageNumber]);

	const ui = (
		<Box component='main'>
			<Typography variant='h1' sx={{mb: 4}}>Events</Typography>

			<Typography sx={{display: 'flex', alignItems: 'center', mb: 2}}>
				<span>Page&nbsp;</span>
				<input
					type='number'
					value={pageNumberControl}
					onChange={handlePageNumberChange}
					min={1}
					max={pageCount}
					step={1}
				/>
				<span>&nbsp;/&nbsp;</span>
				<span>{pageCount}</span>
			</Typography>

			<Grid container spacing={2}>
				{events.map(event => <EventC key={event.id} event={event} />)}
			</Grid>
		</Box>
	);

	return ui;
};

export default EventsC;
