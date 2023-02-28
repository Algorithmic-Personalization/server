import React, {useState, useEffect} from 'react';

import {
	Box,
	Typography,
} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';
import type Event from '../../common/models/event';

import createTableComponent, {type TableDescriptor} from './shared/TableC';
import {UrlC} from './shared/util';

const tableDescriptor: TableDescriptor<Event> = {
	headers: [
		{
			key: 'id',
			element: 'Event ID',
		},
		{
			key: 'type',
			element: 'Event type',
		},
		{
			key: 'timestamp',
			element: 'Timestamp',
		},
		{
			key: 'sessionUuid',
			element: 'Session UUID',
		},
		{
			key: 'url',
			element: 'URL',
		},
	],
	rows: e => ({
		key: e.id.toString(),
		elements: [
			e.id.toString(),
			e.type,
			new Date(e.createdAt),
			e.sessionUuid,
			// eslint-disable-next-line react/jsx-key
			<UrlC url={e.url}/>,
		],
	}),
};

const TableC = createTableComponent(tableDescriptor);

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

			<TableC items={events}/>
		</Box>
	);

	return ui;
};

export default EventsC;
