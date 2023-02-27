import React, {useState, useEffect} from 'react';

import {Box, Grid, Typography} from '@mui/material';

import NotificationsC, {type Message} from './NotificationsC';

import {type ActivityReport} from '../../server/api-2/getActivityReport';
import {type DailyActivityTime} from '../../server/models/dailyActivityTime';

import {useAdminApi} from '../adminApiProvider';

const LegendC: React.FC<{
	text: string;
}> = ({text}) => <Typography
	sx={{
		fontWeight: 'bold',
		display: {xs: 'block', lg: 'none'},
	}}
>
	{text}
</Typography>;

const ReportLineC: React.FC<{
	entry: DailyActivityTime;
}> = ({entry}) => {
	const ui = (
		<Box
			sx={{
				border: {
					xs: '1px solid gray',
					lg: 'none',
				},
				mb: {
					xs: 1,
					lg: 0,
				},
				p: {
					xs: 1,
					lg: 0,
				},
				borderRadius: {
					xs: 1,
					lg: 0,
				},
			}}
		>
			<Grid container spacing={1}>
				<Grid item lg={2} xs={12}>
					<LegendC text='Activity day'/>
					<Typography>{new Date(entry.createdAt).toLocaleDateString()}</Typography>
				</Grid>
				<Grid item lg={2} xs={12}>
					<LegendC text='Participant'/>
					<Typography>{entry.participant?.email}</Typography>
				</Grid>
				<Grid item lg={2} xs={12}>
					<LegendC text='Pages viewed'/>
					<Typography>{entry.pagesViewed}</Typography>
				</Grid>
				<Grid item lg={2} xs={12}>
					<LegendC text='Video pages viewed'/>
					<Typography>{entry.videoPagesViewed}</Typography>
				</Grid>
				<Grid item lg={2} xs={12}>
					<LegendC text='Video time viewed (seconds)'/>
					<Typography>{Math.round(entry.videoTimeViewedSeconds)}</Typography>
				</Grid>
				<Grid item lg={2} xs={12}>
					<LegendC text='Approximate time spent on YouTube'/>
					<Typography>{Math.round(entry.timeSpentOnYoutubeSeconds)}</Typography>
				</Grid>
			</Grid>
		</Box>
	);

	return ui;
};

const ActivityReportC: React.FC<{
	report: ActivityReport;
}> = ({report}) => {
	const ui = (
		<div>
			<Typography variant='h2' sx={{mb: 2}}>Activity Report</Typography>
			<Box sx={{display: {xs: 'none', lg: 'block'}}}>
				<Grid container spacing={1}>
					<Grid item lg={2}>
						<Typography sx={{fontWeight: 'bold'}}>Activity day</Typography>
					</Grid>
					<Grid item lg={2}>
						<Typography sx={{fontWeight: 'bold'}}>Participant</Typography>
					</Grid>
					<Grid item lg={2}>
						<Typography sx={{fontWeight: 'bold'}}>Pages viewed</Typography>
					</Grid>
					<Grid item lg={2}>
						<Typography sx={{fontWeight: 'bold'}}>Video pages viewed</Typography>
					</Grid>
					<Grid item lg={2}>
						<Typography sx={{fontWeight: 'bold'}}>Video time viewed (seconds)</Typography>
					</Grid>
					<Grid item lg={2}>
						<Typography sx={{fontWeight: 'bold'}}>Approximate time spent on YouTube</Typography>
					</Grid>
				</Grid>
			</Box>
			<Box>
				{report.latest.map(entry => <ReportLineC key={entry.id} entry={entry}/>)}
			</Box>
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
