import React, {useState, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Typography} from '@mui/material';

import NotificationsC, {type Message} from './shared/NotificationsC';

import {type ActivityReport} from '../../server/api-2/getActivityReport';
import {type DailyActivityTime, type DailyMetrics} from '../../server/models/dailyActivityTime';

import {useAdminApi} from '../adminApiProvider';

import createTableComponent, {type TableDescriptor} from './shared/TableC';
import {type LocalDateTime} from '../../util';

const showDate = (preDate: Date | string, includeTime = false): React.ReactElement => {
	try {
		const date = typeof preDate === 'string' ? new Date(preDate) : preDate;
		const d = date.getFullYear();
		const m = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');

		if (!includeTime) {
			return <>{d}-{m}-{day}</>;
		}

		const h = date.getHours().toString().padStart(2, '0');
		const min = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');

		return <>{d}-{m}-{day}&nbsp;{h}:{min}:{s}</>;
	} catch (e) {
		return <>Error showing date ({JSON.stringify(preDate)})</>;
	}
};

const showLocalDate = (d: LocalDateTime): React.ReactElement => (
	<>
		{d.year}-{d.month.toString().padStart(2, '0')}-{d.day.toString().padStart(2, '0')}
		&nbsp;
		{d.hour.toString().padStart(2, '0')}:{d.minute.toString().padStart(2, '0')}:{d.second.toString().padStart(2, '0')}
	</>
);

const tableDescriptor: TableDescriptor<DailyActivityTime> = {
	headers: [
		{
			key: 'activityDay',
			element: 'Activity day',
		},
		{
			key: 'participant',
			element: 'Participant',
		},
		{
			key: 'pages-viewed',
			element: 'Pages viewed',
		},
		{
			key: 'video-pages-viewed',
			element: 'Video pages viewed',
		},
		{
			key: 'sidebar-clicked',
			element: 'Sidebar recommendations clicked',
		},
		{
			key: 'watch-time',
			element: 'Watch time (minutes)',
		},
		{
			key: 'youtube-time',
			element: 'Approximate time spent on YouTube (minutes)',
		},
	],
	rows: a => ({
		key: a.id.toString(),
		elements: [
			showDate(a.createdAt),
			// eslint-disable-next-line react/jsx-key
			<Link to={`/participants/${a.participant?.code ?? 'unknown'}`}>{a.participant?.code ?? '<unknown, this is a bug>'}</Link>,
			a.pagesViewed,
			a.videoPagesViewed,
			a.sidebarRecommendationsClicked,
			Math.round(a.videoTimeViewedSeconds / 60),
			Math.round(a.timeSpentOnYoutubeSeconds / 60),
		],
	}),
};

const MetricsC: React.FC<{
	data: DailyMetrics[];
}> = ({data}) => {
	const td: TableDescriptor<DailyMetrics> = {
		headers: [
			{
				key: 'day',
				element: 'Day',
			},
			{
				key: 'n-participants',
				element: 'Number of participants with at least a session',
			},
			{
				key: 'pages-viewed',
				element: 'Pages viewed',
			},
			{
				key: 'video-pages-viewed',
				element: 'Video pages viewed',
			},
			{
				key: 'sidebar-clicked',
				element: 'Sidebar recommendations clicked',
			},
			{
				key: 'watch-time',
				element: 'Watch time (minutes)',
			},
			{
				key: 'youtube-time',
				element: 'Approximate time spent on YouTube (minutes)',
			},
		],
		rows: a => ({
			key: a.day.toString(),
			elements: [
				showDate(a.day),
				a.nParticipants,
				a.pagesViewed,
				a.videoPagesViewed,
				a.sidebarRecommendationsClicked,
				Math.round(a.videoTimeViewedSeconds / 60),
				Math.round(a.timeSpentOnYoutubeSeconds / 60),
			],
		}),
	};

	return (
		<div>
			{createTableComponent(td)({items: data})}
		</div>
	);
};

const TableC = createTableComponent(tableDescriptor);

const ActivityReportC: React.FC<{
	report: ActivityReport;
}> = ({report}) => {
	const ui = (
		<div>
			<Typography variant='h2' sx={{mb: 2}}>Activity Report</Typography>
			<Typography variant='h3' sx={{mb: 2}}>Daily totals</Typography>
			<MetricsC data={report.totals}/>
			<br />
			<Typography variant='h3' sx={{mb: 2}}>Daily averages</Typography>
			<MetricsC data={report.averages}/>
			<Typography variant='h3' sx={{mb: 2}}>Latest participant-level activity</Typography>
			<br />
			<TableC items={report.latest}/>
		</div>
	);

	return ui;
};

export const HomeC: React.FC = () => {
	const [report, setReport] = useState<ActivityReport>();
	const [message, setMessage] = useState<Message>();

	const api = useAdminApi();

	useEffect(() => {
		(async () => {
			const report = await api.getActivityReport();
			if (report.kind === 'Success') {
				console.log('report', report.value);
				setReport(report.value);
			} else {
				setMessage({
					text: report.message,
					severity: 'error',
				});
			}
		})();
	}, []);

	if (!report) {
		return (
			<div>
				<Typography variant='h1' sx={{mb: 4}}>Home</Typography>
				<NotificationsC message={message}/>
				<Typography>Loading report...</Typography>
			</div>
		);
	}

	const ui = (
		<div>
			<Typography variant='h1' sx={{mb: 4}}>Home</Typography>
			<p>
				<strong>Note:</strong>&nbsp; All dates are given in server time, right now the date on the server is: {showLocalDate(report.serverNow)}
			</p>
			<NotificationsC message={message}/>
			{!report && <Typography>Loading report...</Typography>}
			{report && <ActivityReportC report={report} />}
		</div>
	);

	return ui;
};

export default HomeC;
