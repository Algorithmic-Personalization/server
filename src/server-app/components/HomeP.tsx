import React, {useState, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Typography} from '@mui/material';

import NotificationsC, {type Message} from './shared/NotificationsC';

import {type ActivityReport} from '../../server/api-2/getActivityReport';
import {type DailyActivityTime} from '../../server/models/dailyActivityTime';

import {useAdminApi} from '../adminApiProvider';

import createTableComponent, {type TableDescriptor} from './shared/TableC';

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
			new Date(a.createdAt).toLocaleDateString(),
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

const TableC = createTableComponent(tableDescriptor);

const ActivityReportC: React.FC<{
	report: ActivityReport;
}> = ({report}) => {
	const ui = (
		<div>
			<Typography variant='h2' sx={{mb: 2}}>Activity Report</Typography>
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
				setReport(report.value);
			} else {
				setMessage({
					text: report.message,
					severity: 'error',
				});
			}
		})();
	}, []);

	const ui = (
		<div>
			<Typography variant='h1' sx={{mb: 4}}>Home</Typography>
			<NotificationsC message={message}/>
			{!report && <Typography>Loading report...</Typography>}
			{report && <ActivityReportC report={report} />}
		</div>
	);

	return ui;
};

export default HomeC;
