import {Box, Paper, InputLabel, Typography} from '@mui/material';
import React, {useRef, useState} from 'react';

import dayjs from 'dayjs';
import {DatePicker} from '@mui/x-date-pickers';

export const MonitoringC: React.FC = () => {
	const fromRef = useRef<HTMLInputElement>(null);
	const toRef = useRef<HTMLInputElement>(null);

	const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'week'));
	const [toDate, setToDate] = useState(dayjs());

	if (fromRef.current) {
		fromRef.current.id = 'fromDate';
	}

	if (toRef.current) {
		toRef.current.id = 'toDate';
	}

	const ui = (
		<Box component='section' sx={{mb: 4}}>
			<Typography variant='h2' sx={{mb: 2}}>Monitoring</Typography>
			<Paper sx={{m: 2, p: 2}}>
				<Box>
					<InputLabel htmlFor='fromDate'>Start date</InputLabel>
					<DatePicker inputRef={fromRef} value={dayjs(fromDate)} onChange={e => {
						if (e) {
							setFromDate(e);
						}
					}}/>
				</Box>
				<Box>
					<InputLabel htmlFor='toDate'>End date</InputLabel>
					<DatePicker inputRef={toRef} value={dayjs(toDate)} onChange={e => {
						if (e) {
							setToDate(e);
						}
					}}/>
				</Box>
			</Paper>
		</Box>
	);

	return ui;
};

export default MonitoringC;
