import React, {useEffect, useRef, useState} from 'react';

import NotificationsC, {type Message} from './shared/NotificationsC';

import {Box, Paper, InputLabel, Typography} from '@mui/material';

import dayjs from 'dayjs';
import {DatePicker} from '@mui/x-date-pickers';

import {useAdminApi} from '../adminApiProvider';

import {type MonitoringReport} from '../../server/api-2/monitoring';

import {createTableComponent, type TableDescriptor} from './shared/TableC';
import {type RequestLog} from '../../server/models/requestLog';

import RequestLogC from './RequestLogC';

type UrlAndCount = {url: string; count: number};

const mostViewedDescriptor: TableDescriptor<UrlAndCount> = {
	headers: [
		{
			key: 'url',
			element: 'URL',
		},
		{
			key: 'count',
			element: 'Count',
		},
	],
	rows: e => ({
		key: e.url,
		elements: [
			e.url,
			e.count,
		],
	}),
};

type UrlAndShare = UrlAndCount & {share: number};

const shareDescriptor: TableDescriptor<UrlAndShare> = {
	headers: [
		...mostViewedDescriptor.headers,
		{
			key: 'share',
			element: 'Share of total',
		},
	],
	rows: e => ({
		key: mostViewedDescriptor.rows(e).key,
		elements: [
			...mostViewedDescriptor.rows(e).elements,
			`${(e.share * 100).toFixed(2)}%`,
		],
	}),
};

const groupByUrlType = (items: UrlAndCount[]): UrlAndCount[] => {
	const groups = new Map<string, number>();

	const getType = (urlStr: string): string => {
		try {
			const url = new URL(urlStr);
			const type = url.pathname.split('/')[1];
			return type;
		} catch (e) {
			return urlStr;
		}
	};

	const normalizeType = (type: string): string => {
		if (!type.startsWith('/')) {
			return `/${type}`;
		}

		return type;
	};

	for (const item of items) {
		const type = normalizeType(getType(item.url));

		const count = groups.get(type) ?? 0;
		groups.set(type, count + item.count);
	}

	return [...groups.entries()].sort((a, b) => b[1] - a[1]).map(
		([type, count]) => ({
			url: type,
			count,
		}),
	);
};

const addShare = (items: UrlAndCount[]): UrlAndShare[] => {
	const total = items.reduce((acc, item) => acc + item.count, 0);

	return items.map(item => ({
		...item,
		share: item.count / total,
	}));
};

const MostViewedTableC = createTableComponent(mostViewedDescriptor);
const ShareTableC = createTableComponent(shareDescriptor);

const ReportC: React.FC<{data: MonitoringReport}> = ({data}) => (
	<Box component={Paper} sx={{my: 4, p: 2}}>
		<Typography variant='h4'>KPIs</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Unique active participants: {data.nUniqueParticipants}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Total number of pages viewed: {data.nPagesViewed}</Typography>
		<Typography variant='body1' sx={{mb: 2}}>Average request latency: {data.averageLatency} ms</Typography>

		<Typography variant='h4'>Most viewed paths</Typography>
		<ShareTableC items={addShare(groupByUrlType(data.mostViewedPages))}/>

		<Box sx={{my: 2}}>
			<hr/>
		</Box>

		<Typography variant='h4'>Most viewed pages</Typography>
		<MostViewedTableC items={data.mostViewedPages}/>
	</Box>
);

export const MonitoringC: React.FC = () => {
	const fromRef = useRef<HTMLInputElement>(null);
	const toRef = useRef<HTMLInputElement>(null);

	const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'week'));
	const [toDate, setToDate] = useState(dayjs());

	const [report, setReport] = useState<MonitoringReport>();
	const [message, setMessage] = useState<Message>();
	const [requestLog, setRequestLog] = useState<RequestLog[]>([]);

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const data = await api.getMonitoringReport({fromDate: fromDate.toDate(), toDate: toDate.toDate()});
			if (data.kind === 'Success') {
				setReport(data.value);
			} else {
				setMessage({
					severity: 'error',
					text: data.message,
				});
			}
		})();

		(async () => {
			const stream = false;

			if (stream) {
				await api.scanRequestsLog({
					fromDate: fromDate.toDate(),
					toDate: toDate.toDate(),
				}, entry => {
					setRequestLog([...requestLog, entry]);
				});
			} else {
				const newLog: RequestLog[] = [];

				await api.scanRequestsLog({
					fromDate: fromDate.toDate(),
					toDate: toDate.toDate(),
				}, entry => {
					newLog.push(entry);
				});

				setRequestLog(newLog);
			}
		})();
	}, [fromDate, toDate]);

	if (fromRef.current) {
		fromRef.current.id = 'fromDate';
	}

	if (toRef.current) {
		toRef.current.id = 'toDate';
	}

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Monitoring</Typography>

			<NotificationsC message={message}/>

			<Paper sx={{p: 2}}>
				<Box>
					<InputLabel htmlFor='fromDate'>Start date (excluded)</InputLabel>
					<DatePicker inputRef={fromRef} value={dayjs(fromDate)} onChange={e => {
						if (e) {
							setFromDate(e);
						}
					}}/>
				</Box>
\				<Box>
					<InputLabel htmlFor='toDate'>End date (included)</InputLabel>
					<DatePicker inputRef={toRef} value={dayjs(toDate)} onChange={e => {
						if (e) {
							setToDate(e);
						}
					}}/>
				</Box>
			</Paper>
			<Paper sx={{p: 2, mt: 4}}>
				<Typography variant='h3'>Request log</Typography>
				<RequestLogC entries={requestLog}/>
			</Paper>
			{report && <ReportC data={report}/>}
			{!report && <Typography>Loading report</Typography>}
		</Box>
	);

	return ui;
};

export default MonitoringC;
